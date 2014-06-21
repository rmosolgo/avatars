class App.AvatarCanvasView extends Batman.View
  KEY_SENSITIVITY: 3

  _checkForChanges: ->
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

  viewWillDisappear: ->
    console.log "restoring Batman.redirect"
    $(window).off("beforeunload", @_beforeUnload)
    Batman.redirect = @_oldRedirect

  viewDidAppear: ->
    return if @canvas?
    @scope = new paper.PaperScope
    @canvas = $(@node).find('canvas')[0]
    @scope.setup(@canvas)
    tool = new Tool
    @_checkForChanges()

    tool.onMouseDown = (e) => @onMouseDown(e)
    tool.onMouseDrag = (e) => @onMouseDrag(e)
    tool.onKeyDown = (e) =>
      if handler = @KEY_HANDLERS[e.key]
        handler.call(@)
      else
        console.log e.key

  onMouseDown: (e) ->
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

  onMouseDrag: (e) ->
    if e.delta?
      @moveBy(e.delta.x, e.delta.y)
      @canvasWasChanged()

  _testItem: (item, point) ->
    return false if item.dontSelect
    targetItemTest = item.hitTest(point, fill: true)
    targetItemTest? and targetItemTest.color.alpha isnt 0

  moveBy: (x, y)->
    return unless lastPostion = @get('currentItem')?.position
    newPosition = [lastPostion.x + x, lastPostion.y + y]
    @get('currentItem')?.position = newPosition
    @canvasWasChanged()

  zoomOut: ->
    @get('currentItem')?.scale(0.9)
    @canvasWasChanged()

  zoomIn: ->
    @get('currentItem')?.scale(1.1)
    @canvasWasChanged()

  rotateLeft: ->
    @get('currentItem')?.rotate(-5)
    @canvasWasChanged()

  rotateRight: ->
    @get('currentItem')?.rotate(5)
    @canvasWasChanged()

  sendToBack: ->
    return unless item = @get('currentItem')
    item.sendToBack()
    item.feature.set('index', item.index)
    @canvasWasChanged()

  bringToFront: ->
    return unless item = @get('currentItem')
    item.bringToFront()
    item.feature.set('index', item.index)
    @canvasWasChanged()

  canvasWasChanged: ->
    paper.view.draw()
    @set('wasChanged', true)

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
    "=": -> @zoomIn()
    "<": -> @rotateLeft()
    ">": -> @rotateRight()
