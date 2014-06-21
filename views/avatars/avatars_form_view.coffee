class App.AvatarsFormView extends App.AvatarCanvasView
  constructor: ->
    super
    @set 'selectedComponentId', null
    @observe 'selectedComponent', (nv, ov) =>
      if nv?
        console.log "adding component", nv
        @addFeature(nv)

  @accessor 'selectedComponent', ->
    App.Component.get('loaded.indexedByUnique.id').get(@get('selectedComponentId'))

  viewDidAppear: ->
    super
    @loadAvatar()

  canvasWasChanged: ->
    super
    @controller.get('avatar').set('imageDataURI', @canvas.toDataURL())

  addFeature: (component) ->
    imageDataURI = component.get('imageDataURI')
    name = component.get('name')
    {x, y} = paper.view.center
    raster = new paper.Raster(
      imageDataURI
      [component.get('defaultX') || x, component.get('defaultY') || y]
      )
    raster.scale(component.get('defaultScale') || 1)
    index = raster.index
    feature = @controller.get('avatar.features').build({
      name,
      imageDataURI,
      x, y, scale: 1,
      raster, index
      })

    raster.feature = feature
    @set('currentItem', raster)
    @unset('selectedComponentId')
    @canvasWasChanged()

  moveBy: (x, y)->
    return unless lastPostion = @get('currentItem')?.position
    newPosition = [lastPostion.x, lastPostion.y + y]
    @get('currentItem')?.position = newPosition
    @canvasWasChanged()

  activateFeature: (feature) ->
    @set('currentItem', feature.get('raster'))

  remove: ->
    return unless raster = @get('currentItem')
    @controller.get('avatar.features').remove(raster.feature)
    raster.remove()
    @unset('currentItem')
    @canvasWasChanged()

  removeFeature: (feature) ->
    raster = feature.get('raster')
    @controller.get('avatar.features').remove(feature)
    if raster == @get('currentItem')
      @unset('currentItem')
    raster.remove()
    @canvasWasChanged()

  downloadAvatar: ->
    uri = @controller.get('avatar.imageDataURI')
    link = document.createElement("a")
    link.download = "avatar.png"
    link.href = uri
    link.click()

  saveAvatar: ->
    @set('saveMessage', "Saving...")
    avatar = @controller.get('avatar')
    avatar.get('features').forEach (f) -> f.updateFromRaster()
    avatar.save =>
      @set('wasChanged', false)
      @unset('saveMessage')

  loadAvatar: ->
    avatar = @controller.get('avatar')
    avatar.get('features.sortedBy.index').forEach (f) ->
      raster = f.generateRaster(paper)


