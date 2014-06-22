class App.AvatarsController extends App.ApplicationController
  routingKey: "avatars"
  new: ->
    @render(false)
    App.Component.load =>
      @set 'avatar', new App.Avatar
      @render()


  index: ->
    @set 'avatars', App.Avatar.get('all')

  save: ->
    @get('avatar').save (err, record) =>
      if err?
        if !(err instanceof Batman.ErrorsSet)
          throw err
      else
        @redirect(action: "index")

  edit: (params) ->
    @render(false)
    App.Component.load =>
      App.Avatar.find params.id, (err, record) =>
        @set('avatar', record)
        @render()


