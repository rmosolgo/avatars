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
    console.log "Adding #{component?.get('name')} as #{type}"
    raster = component.generateRaster(paper)
    if options.index?
      paper.project.activeLayer.insertChild(options.index, raster)
    avatar = @controller.get('avatar')
    feature = new App.Feature({
      avatar
      name: component.get('name')
      type: component.get('type')
      imageDataURI: component.get('imageDataURI')
      x: raster.position.x,
      y: raster.position.y,
      scale: 1,
      raster,
      index: raster.index
    })
    avatar.set(type, feature)
    raster.feature = feature
    @canvasWasChanged()
    feature

  addFeature: (component) ->
    raster = component.generateRaster(paper)
    name = component.get('name')
    type = component.get('type')
    index = raster.index
    feature = @controller.get('avatar.features').build({
      name,
      imageDataURI: component.get('imageDataURI')
      x: raster.position.x,
      y: raster.position.y,
      scale: 1,
      raster, index, type
      })
    raster.feature = feature
    @set('currentItem', raster)
    @unset('selectedComponentId')
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
    if avatar.get('features.length')
      # extra features:
      avatar.get('features.sortedBy.index').forEach (f) ->
        console.log "adding feature #{f.get('name')}"
        raster = f.generateRaster(paper)
    else
      for type in App.Component.TYPES
        if feature = avatar.get("#{type}.target")
          feature.generateRaster(paper)
        else # default
          @randomForType(type)
    @set('wasChanged', false)


  randomForType: (type) ->
    typeHash = @_typeIds[type]
    len = typeHash.ids.length
    index = Math.floor(Math.random() * len)
    typeHash.current = index
    componentId = typeHash.ids[index]
    component = App.Component.get('loaded').indexedByUnique('id').get(componentId)
    feature = @addFeatureAsType(component, type)