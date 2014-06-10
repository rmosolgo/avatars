class App.Avatar extends Batman.Model
  @resourceName: 'avatar'
  @persist BatFire.Storage
  @encode 'imageDataURI', 'name'
  @validate 'name', presence: true
  @validate 'imageDataURI', presence: true
