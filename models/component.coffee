class App.Component extends Batman.Model
  @resourceName: 'component'
  @persist BatFire.Storage
  @TYPES: ["Hair", "Eyes", "Nose", "Mouth", "Head", "Body"]
  @encode 'imageDataURI', 'name', 'description', 'type',
    'defaultX', 'defaultY', 'defaultScale'
  @validate 'imageDataURI', presence: true
  @validate 'name', presence: true

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