class App.AvatarsController extends App.ApplicationController
  routingKey: "avatars"
  new: ->
    @set 'avatar', new App.Avatar

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
    App.Avatar.find params.id, (err, record) =>
      @set('avatar', record)
      @render()


