Batman.config.usePushState = false # harp won't play well with pushState routes

class @App extends Batman.App
  @root 'avatars#new'
  @resources 'components'
  @resources 'avatars'

  @syncsWithFirebase "pcoavatars"
  @authorizesWithFirebase("github")
  @on 'run', ->
    paper.install(window)

$ -> App.run()