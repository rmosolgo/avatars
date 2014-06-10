(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Batman.config.usePushState = false;

  this.App = (function(_super) {
    __extends(App, _super);

    function App() {
      return App.__super__.constructor.apply(this, arguments);
    }

    App.root('avatars#new');

    App.resources('components');

    App.resources('avatars');

    App.syncsWithFirebase("pcoavatars");

    App.authorizesWithFirebase("github");

    App.on('run', function() {
      return paper.install(window);
    });

    return App;

  })(Batman.App);

  $(function() {
    return App.run();
  });

  App.Avatar = (function(_super) {
    __extends(Avatar, _super);

    function Avatar() {
      return Avatar.__super__.constructor.apply(this, arguments);
    }

    Avatar.resourceName = 'avatar';

    Avatar.persist(BatFire.Storage);

    Avatar.encode('imageDataURI', 'name');

    Avatar.validate('name', {
      presence: true
    });

    Avatar.validate('imageDataURI', {
      presence: true
    });

    return Avatar;

  })(Batman.Model);

  App.Component = (function(_super) {
    __extends(Component, _super);

    Component.resourceName = 'component';

    Component.persist(BatFire.Storage);

    Component.encode('imageDataURI', 'name', 'description');

    Component.validate('imageDataURI', {
      presence: true
    });

    Component.validate('name', {
      presence: true
    });

    function Component() {
      Component.__super__.constructor.apply(this, arguments);
      this.observe('imageFile', function(nV, oV) {
        if (nV != null) {
          return this._setImageDataURIFromFile();
        } else {
          return this.set('imageDataURI', "");
        }
      });
    }

    Component.prototype._setImageDataURIFromFile = function() {
      var file, reader;
      file = this.get('imageFile');
      reader = new FileReader;
      reader.onload = (function(_this) {
        return function(e) {
          var dataURI;
          dataURI = e.target.result;
          return _this.set('imageDataURI', dataURI);
        };
      })(this);
      return reader.readAsDataURL(file);
    };

    return Component;

  })(Batman.Model);

  App.ApplicationController = (function(_super) {
    __extends(ApplicationController, _super);

    function ApplicationController() {
      return ApplicationController.__super__.constructor.apply(this, arguments);
    }

    ApplicationController.prototype.save = function(obj, callback) {
      return obj.save((function(_this) {
        return function(err, record) {
          if (err != null) {
            if (!(err instanceof Batman.ErrorsSet)) {
              throw err;
            }
          } else {
            return typeof callback === "function" ? callback(err, record) : void 0;
          }
        };
      })(this));
    };

    ApplicationController.prototype.destroy = function(obj, callback) {
      return obj.destroy((function(_this) {
        return function(err, record) {
          if (err != null) {
            throw err;
          } else {
            return typeof callback === "function" ? callback(err, record) : void 0;
          }
        };
      })(this));
    };

    return ApplicationController;

  })(Batman.Controller);

  App.AvatarsController = (function(_super) {
    __extends(AvatarsController, _super);

    function AvatarsController() {
      return AvatarsController.__super__.constructor.apply(this, arguments);
    }

    AvatarsController.prototype.routingKey = "avatars";

    AvatarsController.prototype["new"] = function() {
      return this.set('avatar', new App.Avatar);
    };

    AvatarsController.prototype.index = function() {
      return this.set('avatars', App.Avatar.get('all'));
    };

    AvatarsController.prototype.save = function() {
      return this.get('avatar').save((function(_this) {
        return function(err, record) {
          if (err != null) {
            if (!(err instanceof Batman.ErrorsSet)) {
              throw err;
            }
          } else {
            return _this.redirect({
              action: "index"
            });
          }
        };
      })(this));
    };

    return AvatarsController;

  })(App.ApplicationController);

  App.ComponentsController = (function(_super) {
    __extends(ComponentsController, _super);

    function ComponentsController() {
      return ComponentsController.__super__.constructor.apply(this, arguments);
    }

    ComponentsController.prototype.routingKey = "components";

    ComponentsController.prototype.index = function() {};

    ComponentsController.prototype["new"] = function() {
      return this.set('component', new App.Component);
    };

    ComponentsController.prototype.edit = function(params) {
      App.Component.find(params.id, (function(_this) {
        return function(err, record) {
          _this.set('component', record);
          return _this.render();
        };
      })(this));
      return this.render(false);
    };

    ComponentsController.prototype.save = function(component) {
      return ComponentsController.__super__.save.call(this, component, (function(_this) {
        return function(e, r) {
          return _this.redirect({
            action: "index"
          });
        };
      })(this));
    };

    ComponentsController.accessor('componentGroups', function() {
      return App.Component.get('all').inGroupsOf(4);
    });

    return ComponentsController;

  })(App.ApplicationController);

  App.AvatarsNewView = (function(_super) {
    __extends(AvatarsNewView, _super);

    function AvatarsNewView() {
      AvatarsNewView.__super__.constructor.apply(this, arguments);
      this.set('selectedComponentId', null);
      this.observe('selectedComponent', (function(_this) {
        return function(nv, ov) {
          if (nv != null) {
            return _this.addComponent();
          }
        };
      })(this));
    }

    AvatarsNewView.accessor('selectedComponent', function() {
      return App.Component.get('loaded.indexedByUnique.id').get(this.get('selectedComponentId'));
    });

    AvatarsNewView.prototype.on('viewDidAppear', function() {
      var initialPoint, tool;
      if (this.canvas != null) {
        return;
      }
      this.scope = new paper.PaperScope;
      this.canvas = $(this.node).find('canvas')[0];
      this.scope.setup(this.canvas);
      tool = new Tool;
      initialPoint = null;
      tool.onMouseDown = (function(_this) {
        return function(e) {
          var currentItem, item, _i, _len, _ref, _results;
          if (e.item == null) {
            return;
          }
          currentItem = _this.get('currentItem');
          if (_this._testItem(e.item, e.point)) {
            return _this.set('currentItem', e.item);
          } else if ((currentItem != null) && _this._testItem(currentItem, e.point)) {

          } else {
            _ref = _this.scope.project.activeLayer.children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (_this._testItem(item, e.point)) {
                _this.set('currentItem', item);
                break;
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      })(this);
      return tool.onMouseDrag = (function(_this) {
        return function(e) {
          var lastPostion, newPosition, _ref, _ref1;
          if (e.delta != null) {
            lastPostion = (_ref = _this.get('currentItem')) != null ? _ref.position : void 0;
            newPosition = [lastPostion.x + e.delta.x, lastPostion.y + e.delta.y];
            if ((_ref1 = _this.get('currentItem')) != null) {
              _ref1.position = newPosition;
            }
            return _this._updateAvatar();
          }
        };
      })(this);
    });

    AvatarsNewView.prototype._testItem = function(item, point) {
      var targetItemIsPresent, targetItemTest;
      targetItemTest = item.hitTest(point, {
        fill: true
      });
      return targetItemIsPresent = targetItemTest.color.alpha !== 0;
    };

    AvatarsNewView.prototype.zoomOut = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.scale(0.9);
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.zoomIn = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.scale(1.1);
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.remove = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.remove();
      }
      this.unset('currentItem');
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.rotateLeft = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.rotate(-5);
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.rotateRight = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.rotate(5);
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.sendToBack = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.sendToBack();
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.bringToFront = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.bringToFront();
      }
      return this._updateAvatar();
    };

    AvatarsNewView.prototype._updateAvatar = function() {
      paper.view.draw();
      return this.controller.get('avatar').set('imageDataURI', this.canvas.toDataURL());
    };

    AvatarsNewView.prototype.addComponent = function() {
      var component, raster;
      component = this.get('selectedComponent');
      raster = new paper.Raster(component.get('imageDataURI'), paper.view.center);
      raster.component = component;
      this.unset('selectedComponentId');
      return this._updateAvatar();
    };

    AvatarsNewView.prototype.downloadAvatar = function() {
      var link, uri;
      uri = this.controller.get('avatar.imageDataURI');
      link = document.createElement("a");
      link.download = "avatar.png";
      link.href = uri;
      return link.click();
    };

    return AvatarsNewView;

  })(Batman.View);

}).call(this);

Batman.View.store.set('/avatars/index', '<div class=\"row\"><div data-foreach-avatar=\"avatars\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"avatar.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"avatar.name\"></p><p><a data-event-click=\"destroy | withArguments avatar\" class=\"btn btn-danger\">Delete</a></p></div></div></div></div>');
Batman.View.store.set('/avatars/new', '<div class=\"row\"><div class=\"col-sm-12\"><ul data-showif=\"avatar.errors.length\" class=\"list-unstyled alert alert-warning\"><li data-foreach-e=\"avatar.errors\" data-bind=\"e.fullMessage\"></li></ul></div></div><div class=\"row\"><div class=\"col-sm-4\"><div class=\"form-group\"><input type=\"text\" placeholder=\"Who is this?\" data-bind=\"avatar.name\" class=\"form-control\"/></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><select data-bind=\"selectedComponentId\" class=\"form-control\"><option>Select a Component</option><option data-foreach-component=\"Component.all\" data-bind=\"component.name\" data-bind-value=\"component.id\"></option></select></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"well well-small\"><canvas id=\"new-avatar\" style=\"height:300px; width:300px; border: 1px solid black; cursor:pointer;\"></canvas></div></div><div class=\"col-sm-6\"><div class=\"row\"><h3>Selected Component</h3><div style=\"height:100px;\" class=\"img-container\"><img style=\"max-height:100px\" data-bind-src=\"currentItem.component.imageDataURI\"/></div></div><div class=\"row\"><div class=\"col-sm-3\"><a data-event-click=\"zoomIn\" class=\"btn btn-primary\">Zoom In</a></div><div class=\"col-sm-3\"><a data-event-click=\"zoomOut\" class=\"btn btn-primary\">Zoom Out</a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateLeft\" class=\"btn btn-primary\">Rotate Left</a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateRight\" class=\"btn btn-primary\">Rotate Right</a></div></div><br/><div class=\"row\"><div class=\"col-sm-3\"><a data-event-click=\"bringToFront\" class=\"btn btn-primary\">Bring to Front</a></div><div class=\"col-sm-3\"><a data-event-click=\"sendToBack\" class=\"btn btn-primary\">Send to Back</a></div><div class=\"col-sm-3\"><a data-event-click=\"remove\" class=\"btn btn-danger\">Remove</a></div></div></div></div><div class=\"row\"><div class=\"col-md-2\"><a data-event-click=\"downloadAvatar\" class=\"btn btn-primary\">Download Avatar</a></div><div class=\"col-sm-2\">All finished?<a data-event-click=\"save\" class=\"btn btn-success\">Save Avatar</a></div></div>');
Batman.View.store.set('/components/edit', '<div data-partial=\"components/form\"></div>');
Batman.View.store.set('/components/form', '<form data-formfor-c=\"component\" data-event-submit=\"save | withArguments component\"><div class=\"row\"><div data-showif=\"c.errors.length\" class=\"alert alert-danger\"><ul class=\"list-unstyled\"><li data-foreach-error=\"c.errors\" data-bind=\"error.fullMessage\"></li></ul></div></div><div class=\"row\"><div class=\"well\"><div style=\"height:200px;width:100%\" class=\"img-container\"><p data-showif=\"c.imageDataURI | not\">Upload an image to see a preview!</p><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"c.imageDataURI\"/></div></div></div><div class=\"row\"><div class=\"form-group\"><label>Name</label><input type=\"text\" data-bind=\"c.name\" placeholder=\"name\" class=\"form-control\"/></div><div class=\"form-group\"><label>File</label><input type=\"file\" data-bind=\"c.imageFile\" class=\"form-control\"/></div><div class=\"form-group\"><label>Description</label><textarea data-bind=\"c.description\" placeholder=\"description\" class=\"form-control\"></textarea></div><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-4\"><input type=\"submit\" value=\"Save\" class=\"btn btn-primary\"/></div><div class=\"col-xs-4\"><a data-event-click=\"destroy | withArguments component\" data-showif=\"component.isNew | not\" class=\"btn btn-danger\">Delete</a></div></div></div></div></form>');
Batman.View.store.set('/components/index', '<div class=\"row\"><div class=\"col-sm-6\"><h1 class=\"page-header\">Components</h1></div></div><div class=\"row\"><div class=\"col-sm-3 col-sm-offset-9\"><a data-route=\"routes.components.new\" class=\"btn btn-primary\">New Component</a></div></div><div data-foreach-group=\"componentGroups\" class=\"row\"><div data-foreach-component=\"group\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"component.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"component.name\"></p><a data-route=\"routes.components[component].edit\" class=\"btn btn-primary\">Edit</a><a data-event-click=\"destroy | withArguments component\" class=\"btn btn-danger\">Destroy</a></div></div></div></div>');
Batman.View.store.set('/components/new', '<div data-partial=\"components/form\"></div>');