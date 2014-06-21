class App.AvatarsFormView extends Batman.View
  KEY_SENSITIVITY: 3
  constructor: ->
    super
    @set 'selectedComponentId', null
    @observe 'selectedComponent', (nv, ov) =>
      if nv?
        console.log "adding component", nv
        @addFeature(nv)

  @accessor 'selectedComponent', ->
    App.Component.get('loaded.indexedByUnique.id').get(@get('selectedComponentId'))

  viewWillDisappear: ->
    console.log "restoring Batman.redirect"
    Batman.redirect = @_oldRedirect

  viewDidAppear: ->
    return if @canvas?
    @scope = new paper.PaperScope
    @canvas = $(@node).find('canvas')[0]
    @scope.setup(@canvas)
    tool = new Tool
    $(window).on "beforeunload", @_beforeUnload = =>
      if @get('wasChanged')
        return "Your changes won't be saved!"
      else
        return undefined
    @_oldRedirect = Batman.redirect

    Batman.redirect = =>
      if (msg = @_beforeUnload()) && !confirm("#{msg} \nAre you sure you want to leave this page?")
        console.log "Navigation prevented", msg
      else
        @_oldRedirect.apply(Batman, arguments)

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
        @moveBy(e.delta.x, e.delta.y)
        @_updateAvatar()


    tool.onKeyDown = (e) =>
      if handler = @KEY_HANDLERS[e.key]
        handler.call(@)
      else
        console.log e.key

    # @_showGrid()
    @loadAvatar()

  _testItem: (item, point) ->
    targetItemTest = item.hitTest(point, fill: true)
    targetItemTest? and targetItemTest.color.alpha isnt 0

  moveBy: (x, y)->
    return unless lastPostion = @get('currentItem')?.position
    newPosition = [lastPostion.x + x, lastPostion.y + y]
    @get('currentItem')?.position = newPosition
    @_updateAvatar()

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
    return unless item = @get('currentItem')
    item.sendToBack()
    item.feature.set('index', item.index)
    @_updateAvatar()

  bringToFront: ->
    return unless item = @get('currentItem')
    item.bringToFront()
    item.feature.set('index', item.index)
    @_updateAvatar()

  _updateAvatar: ->
    paper.view.draw()
    @set('wasChanged', true)
    @controller.get('avatar').set('imageDataURI', @canvas.toDataURL())

  addFeature: (component) ->
    imageDataURI = component.get('imageDataURI')
    name = component.get('name')
    {x, y} = paper.view.center
    raster = new paper.Raster(
      imageDataURI
      [x, y]
      )
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

  _showGrid: ->
    @_xGrid ||= paper.Path.Line([0,150], [300, 150])
    @_xGrid.strokeColor = "black"
    @_yGrid ||= paper.Path.Line([150,0], [150, 300])
    @_yGrid.strokeColor = "black"
    paper.view.draw()


  KEY_HANDLERS:
    up: -> @moveBy(0, -@KEY_SENSITIVITY)
    down: -> @moveBy(0, @KEY_SENSITIVITY)
    left: -> @moveBy(-@KEY_SENSITIVITY, 0)
    right: -> @moveBy(@KEY_SENSITIVITY, 0)
    backspace: ->
      if document.activeElement.tagName.toUpperCase() is "BODY"
        @remove()
        return false
    "-": -> @zoomOut()
    "_": -> @zoomOut()
    "+": -> @zoomIn()
    "-": -> @zoomIn()
    "<": -> @rotateLeft()
    ">": -> @rotateRight()
