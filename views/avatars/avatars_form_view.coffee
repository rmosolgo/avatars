class App.AvatarsFormView extends Batman.View
  constructor: ->
    super
    @set 'selectedComponentId', null
    @observe 'selectedComponent', (nv, ov) =>
      if nv?
        @addFeature(nv)

  @accessor 'selectedComponent', ->
    App.Component.get('loaded.indexedByUnique.id').get(@get('selectedComponentId'))

  @::on 'viewDidAppear', ->

    return if @canvas?
    @scope = new paper.PaperScope
    @canvas = $(@node).find('canvas')[0]
    @scope.setup(@canvas)
    tool = new Tool

    tool.onMouseDown = (e) =>
      $('input, select').blur()
      return unless e.item?
      currentItem = @get('currentItem')
      if @_testItem(e.item, e.point)
        # console.log "selecting the clicked item"
        @set('currentItem', e.item)
      else if currentItem? and @_testItem(currentItem, e.point)
        # console.log "keeping the current item"
      else
        for item in @scope.project.activeLayer.children
          if @_testItem(item, e.point)
            # console.log "selecting a lower item"
            @set('currentItem', item)
            break

    tool.onMouseDrag = (e) =>
      if e.delta?
        @moveBy(e.delta.x, 0)
        @_updateAvatar()

    KEY_SENSITIVITY = 3
    tool.onKeyDown = (e) =>
      switch e.key
        when "up"
          @moveBy(0, -KEY_SENSITIVITY)
        when "down"
          @moveBy(0, KEY_SENSITIVITY)
        when "left"
          @rotateLeft()
        when "right"
          @rotateRight()
        when "backspace"
          @remove()
      return false


    @loadAvatar()

  _testItem: (item, point) ->
    targetItemTest = item.hitTest(point, fill: true)
    targetItemTest? and targetItemTest.color.alpha isnt 0

  moveBy: (x, y)->
    return unless lastPostion = @get('currentItem')?.position
    newPosition = [lastPostion.x + x, lastPostion.y + y]
    @get('currentItem')?.position = newPosition

  zoomOut: ->
    @get('currentItem')?.scale(0.9)
    @_updateAvatar()

  zoomIn: ->
    @get('currentItem')?.scale(1.1)
    @_updateAvatar()


  rotateLeft: ->
    @get('currentItem')?.rotate(-5)
    @_updateAvatar()

  rotateRight: ->
    @get('currentItem')?.rotate(5)
    @_updateAvatar()

  sendToBack: ->
    @get('currentItem')?.sendToBack()
    @_updateAvatar()

  bringToFront: ->
    @get('currentItem')?.bringToFront()
    @_updateAvatar()

  _updateAvatar: ->
    paper.view.draw()
    @controller.get('avatar').set('imageDataURI', @canvas.toDataURL())

  addFeature: (component) ->
    imageDataURI = component.get('imageDataURI')
    name = component.get('name')
    {x, y} = paper.view.center
    raster = new paper.Raster(
      imageDataURI
      [x, y]
      )

    feature = @controller.get('avatar.features').build({
      name,
      imageDataURI,
      x, y, scale: 1,
      raster
      })

    raster.feature = feature
    @unset('selectedComponentId')
    @_updateAvatar()

  activateFeature: (feature) ->
    @set('currentItem', feature.get('raster'))

  remove: ->
    return unless raster = @get('currentItem')
    @controller.get('avatar.features').remove(raster.feature)
    raster.remove()
    @unset('currentItem')
    @_updateAvatar()

  removeFeature: (feature) ->
    @controller.get('avatar.features').remove(feature)
    if raster = @get('currentItem')
      @unset('currentItem')
    raster.remove()
    @_updateAvatar()

  downloadAvatar: ->
    uri = @controller.get('avatar.imageDataURI')
    link = document.createElement("a")
    link.download = "avatar.png"
    link.href = uri
    link.click()

  saveAvatar: ->
    avatar = @controller.get('avatar')
    avatar.get('features').forEach (f) -> f.updateFromRaster()
    avatar.save()

  loadAvatar: ->
    avatar = @controller.get('avatar')
    avatar.get('features').forEach (f) ->
      raster = f.generateRaster(paper)
