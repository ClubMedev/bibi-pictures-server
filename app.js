const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const db = require("./models");
const multer = require("multer");

app.use(express.json());

// Configure Multer to store file data in memory
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB in bytes
  },
});

/**
 * PHOTO TABLE REQUESTS
 */
// Post a photo
app.post("/photo", upload.single("photo"), async (req, res) => {
  try {
    const { pseudonym } = req.body;
    const photo = req.file ? req.file.buffer : null;

    if (!photo) {
      return res.status(500).json({ error: "You must provide a photo." });
    }

    const newPhoto = await db.Photo.create({
      pseudonyme: pseudonym,
      photo: photo,
    });
    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get photo by id
app.get("/photo/:id", async (req, res) => {
  try {
    const photo = await db.Photo.findByPk(req.params.id);
    if (photo) {
      res.status(200).json(photo);
    } else {
      res.status(404).json({ error: "Photo not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pagination request (page 1 and 10 objects by default)
app.get("/photo", async (req, res) => {
  // Get page and limit from query parameters, with defaults
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Calculate the offset
  const offset = (page - 1) * limit;

  try {
    // Fetch paginated photos and the total count of photos
    const { rows: photos, count: totalPhotos } = await db.Photo.findAndCountAll(
      {
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]], // Order by creation date (adjust as needed)
      }
    );

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalPhotos / limit);

    // Send paginated data and meta information as response
    res.json({
      data: photos,
      meta: {
        totalPhotos,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete photo by id
app.delete("/photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.Photo.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: "Photo not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ADMIN_PHOTO TABLE REQUESTS
 */
// post a  photo
app.post("/admin_photo", upload.single("photo"), async (req, res) => {
  try {
    const { location } = req.body;
    const photo = req.file ? req.file.buffer : null;

    if (!photo) {
      return res.status(500).json({ error: "You must provide a photo." });
    }

    const dbPhoto = await db.admin_photos.create({
      location: location,
      photo: photo,
    });
    res.status(201).json(dbPhoto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get all photos
app.get("/admin_photo/all", async (req, res) => {
  try {
    const photos = await db.admin_photos.findAll();
    const photosTreated = []; // I don't want any previous data values so I make sure of it to not bloat the response.
    for(let data of photos) {
      photosTreated.push(data.dataValues);
    }
    res.status(200).json(photosTreated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get photo by id
app.get("/admin_photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await db.admin_photos.findByPk(id);

    if (!photo) return res.status(404).json({ error: "Photo not found" });
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// update photo
app.put("/admin_photo/:id", upload.single("photo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;
    const photo = req.file ? req.file.buffer : null;

    const updatedPhoto = await db.admin_photos.update(
      { location, photo },
      { where: { id }, returning: true }
    );

    if (!updatedPhoto[1][0]) {
      return res.status(404).json({ error: "Photo not found" });
    }
    res.status(200).json(updatedPhoto[1][0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete photo by id
app.delete("/admin_photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.admin_photos.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: "Photo not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server listening on: ${PORT}.`);
});
