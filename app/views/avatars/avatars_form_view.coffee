class App.AvatarsFormView extends App.AvatarCanvasView
  constructor: ->
    super
    @set 'selectedComponentId', null
    @observe 'selectedComponent', (nv, ov) =>
      if nv?
        console.log "adding component", nv
        @addFeature(nv)


    @_typeIds = {}
    for type in App.Component.TYPES
      @_typeIds[type] =
        current: 0
        ids: App.Component.get('loaded').indexedBy('type').get(type).sortedBy('name').mapToProperty('id')

  @accessor 'selectedComponent', ->
    App.Component.get('loaded.indexedByUnique.id').get(@get('selectedComponentId'))

  viewDidAppear: ->
    super
    @loadAvatar()

  canvasWasChanged: ->
    super
    @_updateAvatar()

  _updateAvatar: ->
    @controller.get('avatar').set('imageDataURI', @canvas.toDataURL())

  nextForType: (type) ->
    typeHash = @_typeIds[type]
    index = ++typeHash.current
    if index is typeHash.ids.length
      index = typeHash.current = 0
    console.log index, typeHash.current
    @replaceTypeFromIndex(type, index)

  prevForType: (type) ->
    typeHash = @_typeIds[type]
    index = --typeHash.current
    if index is -1
      index = typeHash.current = typeHash.ids.length - 1
    console.log index, typeHash.current
    @replaceTypeFromIndex(type, index)

  replaceTypeFromIndex: (type, index) ->
    componentId = @_typeIds[type].ids[index]
    component = App.Component.get('loaded').indexedByUnique('id').get(componentId)

    prevFeature = @controller.get('avatar').get(type)
    prevRaster = prevFeature.get('raster')
    rasterIndex = prevRaster.index
    prevRaster.remove()
    @controller.get('avatar').unset(type)

    feature = @addFeatureAsType(component, type, {index: rasterIndex})
    @set('currentItem', feature.get('raster'))

  addFeatureAsType: (component, type, options={}) ->
    raster = component.generateRaster(paper)
    if options.index?
      paper.project.activeLayer.insertChild(options.index, raster)
    feature = @_addFeature(component)
    avatar = @controller.get('avatar')
    avatar.set(type, feature)
    feature

  _addFeature: (component) ->
    raster = component.generateRaster(paper)
    avatar = @controller.get('avatar')
    index = raster.index
    feature = App.Feature.fromComponent(component)
    feature.updateAttributes({raster, index, avatar})
    raster.feature = feature
    @set('currentItem', raster)
    @canvasWasChanged()

  addFeature: (component) ->
    feature = @_addFeature(component)
    @controller.get('avatar.features').add(feature)
    @unset('selectedComponentId')
    feature

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
    if avatar.get('features.length')
      # extra features:
      avatar.get('features.sortedBy.index').forEach (f) ->
        raster = f.generateRaster(paper)
    else
      for type in App.Component.TYPES
        feature = avatar.get("#{type}")
        if feature.isProxy
          feature = feature.get('target')
        if feature?
          feature.generateRaster(paper)
    @canvasWasChanged()
    @set('wasChanged', false)


