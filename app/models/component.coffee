class App.Component extends Batman.Model
  @resourceName: 'component'
  @persist BatFire.Storage
  @TYPES: ["body", "head", "mouth", "nose", "eyes", "hair"]
  @encode 'imageDataURI', 'name', 'description', 'type',
    'defaultX', 'defaultY', 'defaultScale'
  @validate 'imageDataURI', presence: true
  @validate 'name', presence: true
  @validate 'type', presence: true
  @validate 'defaultX', (errors, record, attribute, callback) ->
    if !(record.get('defaultX') and record.get('defaultY'))
      errors.add("base", "You must provide a default position!")
    callback()

  constructor: ->
    super
    @observe 'imageFile', (nV, oV) ->
      if nV?
        @_setImageDataURIFromFile()
      else
        @set 'imageDataURI', ""

  _setImageDataURIFromFile: ->
    file = @get('imageFile')
    reader = new FileReader
    reader.onload = (e) =>
      dataURI = e.target.result
      @set 'imageDataURI', dataURI
    reader.readAsDataURL(file)


  generateRaster: (paperObj) ->
    imageDataURI = @get('imageDataURI')
    {x, y} = paperObj.view.center
    raster = new paperObj.Raster(
      imageDataURI
      [@get('defaultX') || x, @get('defaultY') || y]
      )
    raster.scale(@get('defaultScale') || 1)