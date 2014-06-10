class App.AvatarsNewView extends Batman.View
  constructor: ->
    super
    @set 'selectedComponentId', null
    @observe 'selectedComponent', (nv, ov) =>
      if nv?
        @addComponent()

  @accessor 'selectedComponent', ->
    App.Component.get('loaded.indexedByUnique.id').get(@get('selectedComponentId'))

  @::on 'viewDidAppear', ->
    return if @canvas?
    @scope = new paper.PaperScope
    @canvas = $(@node).find('canvas')[0]
    @scope.setup(@canvas)
    tool = new Tool

    initialPoint = null
    tool.onMouseDown = (e) =>
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
        lastPostion = @get('currentItem')?.position
        newPosition = [lastPostion.x + e.delta.x, lastPostion.y + e.delta.y]
        @get('currentItem')?.position = newPosition
        @_updateAvatar()

  _testItem: (item, point) ->
    targetItemTest = item.hitTest(point, fill: true)
    targetItemIsPresent = targetItemTest.color.alpha isnt 0

  zoomOut: ->
    @get('currentItem')?.scale(0.9)
    @_updateAvatar()

  zoomIn: ->
    @get('currentItem')?.scale(1.1)
    @_updateAvatar()

  remove: ->
    @get('currentItem')?.remove()
    @unset('currentItem')
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

  addComponent: ->
    component = @get('selectedComponent')
    raster = new paper.Raster(
      component.get('imageDataURI')
      paper.view.center # || record.get('defaultPosition')
      )
    raster.component = component
    @unset('selectedComponentId')
    @_updateAvatar()

  downloadAvatar: ->
    uri = @controller.get('avatar.imageDataURI')
    link = document.createElement("a")
    link.download = "avatar.png"
    link.href = uri
    link.click()
