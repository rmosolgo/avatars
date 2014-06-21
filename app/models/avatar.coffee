class App.Avatar extends Batman.Model
  @resourceName: 'avatar'
  @persist BatFire.Storage
  @encode 'imageDataURI', 'name'

  @hasMany 'features', saveInline: true

  @validate 'name', presence: true
  @validate 'imageDataURI', presence: true
