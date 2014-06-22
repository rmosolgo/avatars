class App.ComponentsEditView extends App.AvatarCanvasView
  viewDidAppear: ->
    super
    background = new paper.Raster("http://localhost:9000/images/avatar_background.png", paper.view.center)
    background.dontSelect = true
    @addFeature(@controller.get('component'))
    @set('wasChanged', false)

  addFeature: (component) ->
    imageDataURI = component.get('imageDataURI')
    {x, y} = paper.view.center
    raster = new paper.Raster(
      imageDataURI
      [component.get('defaultX') || x, component.get('defaultY') || y]
      )
    raster.scale(component.get('defaultScale') || 1)
    @set('currentItem', raster)

  canvasWasChanged: ->
    super
    newAttrs = {
      defaultX: @get("currentItem").position.x
      defaultY: @get("currentItem").position.y
      defaultScale: @get('currentItem').scaling.x
    }
    @controller.get('component').updateAttributes(newAttrs)

  saveComponent: ->
    @set('saveMessage', "Saving...")
    @controller.get('component').save (e, r) =>
      @unset('saveMessage')
      if e?
        if !(e instanceof Batman.ErrorsSet)
          throw e
      else
        @unset('wasChanged')
        @controller.redirect({action: "index"})