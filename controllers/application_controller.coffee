class App.ApplicationController extends Batman.Controller
  save: (obj, callback) ->
    obj.save (err, record) =>
      if err?
        if !(err instanceof Batman.ErrorsSet)
          throw err
      else
        callback?(err, record)

  destroy: (obj, callback) ->
    obj.destroy (err, record) =>
      if err?
        throw err
      else
        callback?(err, record)
