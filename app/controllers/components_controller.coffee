class App.ComponentsController extends App.ApplicationController
  routingKey: "components"
  index: ->

  new: ->
    @set 'component', new App.Component

  edit: (params) ->
    App.Component.find params.id, (err, record) =>
      @set 'component', record.transaction()
      @render()
    @render(false)

  @accessor 'componentGroups', ->
    App.Component.get('all').inGroupsOf(4)

