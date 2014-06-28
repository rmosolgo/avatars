class App.ApplicationController extends Batman.Controller
  save: (obj, callback) ->
    obj.save (err, record) =>
      if err?
        if !(err instanceof Batman.ErrorsSet)
          throw err
      else
        callback?(err, record)

  destroy: (obj, callback) ->
    return unless confirm("Are you sure you want to delete this #{Batman.helpers.singularize(Batman.helpers.humanize(@get('routingKey')))}?")
    if !(typeof callback is "function")
      callback = => @redirect({action: "index"})
    obj.destroy (err, record) =>
      if err?
        throw err
      else
        callback(err, record)

  dialog: (renderOptions={}) ->
    opts = Batman.extend({into: "modal"}, renderOptions)
    view = @render(opts).on 'ready', =>
      @openDialog()

  openDialog: ->
    $('.modal').modal('show')

  closeDialog: ->
    $('.modal').modal('hide')
    modalYield = Batman.DOM.Yield.get('yields.modal')
    modalYield.get('contentView')?.die()
    modalYield.set('contentView', undefined)

  @beforeAction @::closeDialog


  keyboardShortcuts: ->
    @dialog(source: "keyboard_shortcuts")