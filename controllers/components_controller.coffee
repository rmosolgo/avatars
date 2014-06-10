class App.ComponentsController extends App.ApplicationController
  routingKey: "components"
  index: ->

  new: ->
    @set 'component', new App.Component

  edit: (params) ->
    App.Component.find params.id, (err, record) =>
      @set 'component', record
      @render()
    @render(false)

  save: (component) ->
    super component, (e, r) =>
      @redirect(action: "index")

  @accessor 'componentGroups', ->
    App.Component.get('all').inGroupsOf(4)

