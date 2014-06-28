class App.Avatar extends Batman.Model
  @resourceName: 'avatar'
  @persist BatFire.Storage
  @encode 'imageDataURI', 'name'

  @hasMany 'features', saveInline: true

  @hasOne 'body', name: "Feature", saveInline: true
  @hasOne 'head', name: "Feature", saveInline: true
  @hasOne 'mouth', name: "Feature", saveInline: true
  @hasOne 'nose', name: "Feature", saveInline: true
  @hasOne 'eyes', name: "Feature", saveInline: true
  @hasOne 'hair', name: "Feature", saveInline: true

  @validate 'name', presence: true
  @validate 'imageDataURI', presence: true

  @belongsToCurrentUser()

  @makeTemplate: ->
    avatar = new @
    for type in App.Component.TYPES
      component = App.Component.get('all.indexedBy.type').get(type).get('first')
      feature = App.Feature.fromComponent(component)
      avatar.set(type, feature)
    avatar