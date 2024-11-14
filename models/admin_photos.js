'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class admin_photos extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  admin_photos.init({
    location: DataTypes.STRING,
    photo: DataTypes.BLOB
  }, {
    sequelize,
    modelName: 'admin_photos',
  });
  return admin_photos;
};