class App.Feature extends Batman.Model
  @resourceName: 'feature'
  @persist BatFire.Storage
  @encode 'name', 'imageDataURI',
    'x', 'y', 'scale', 'rotation', 'index',
    'type'
  @belongsTo 'avatar', inverseOf: 'features'

  updateFromRaster: ->
    raster = @get('raster')
    @set 'x', raster.position.x
    @set 'y', raster.position.y
    @set 'scale', raster.scaling.x
    @set 'rotation', raster.rotation
    @set 'index', raster.index

  generateRaster: (paperObj) ->
    raster = new paperObj.Raster(
      @get('imageDataURI'),
      [@get('x'), @get('y')]
      )
    raster.scale(@get('scale') || 1)
    raster.rotate(@get('rotation') || 0)
    @set('raster', raster)
    raster.feature = @
    raster

