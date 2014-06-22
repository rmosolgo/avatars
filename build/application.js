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

    Avatar.hasMany('features', {
      saveInline: true
    });

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

    Component.TYPES = ["Hair", "Eyes", "Nose", "Mouth", "Head", "Body"];

    Component.encode('imageDataURI', 'name', 'description', 'type', 'defaultX', 'defaultY', 'defaultScale');

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

  App.Feature = (function(_super) {
    __extends(Feature, _super);

    function Feature() {
      return Feature.__super__.constructor.apply(this, arguments);
    }

    Feature.resourceName = 'feature';

    Feature.persist(BatFire.Storage);

    Feature.encode('name', 'imageDataURI', 'x', 'y', 'scale', 'rotation', 'index');

    Feature.belongsTo('avatar', {
      inverseOf: 'features'
    });

    Feature.prototype.updateFromRaster = function() {
      var raster;
      raster = this.get('raster');
      this.set('x', raster.position.x);
      this.set('y', raster.position.y);
      this.set('scale', raster.scaling.x);
      this.set('rotation', raster.rotation);
      return this.set('index', raster.index);
    };

    Feature.prototype.generateRaster = function(paperObj) {
      var raster;
      raster = new paperObj.Raster(this.get('imageDataURI'), [this.get('x'), this.get('y')]);
      raster.scale(this.get('scale') || 1);
      raster.rotate(this.get('rotation') || 0);
      this.set('raster', raster);
      raster.feature = this;
      return raster;
    };

    return Feature;

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

    ApplicationController.prototype.dialog = function(renderOptions) {
      var opts, view;
      if (renderOptions == null) {
        renderOptions = {};
      }
      opts = Batman.extend({
        into: "modal"
      }, renderOptions);
      return view = this.render(opts).on('ready', (function(_this) {
        return function() {
          return _this.openDialog();
        };
      })(this));
    };

    ApplicationController.prototype.openDialog = function() {
      return $('.modal').modal('show');
    };

    ApplicationController.prototype.closeDialog = function() {
      var modalYield, _ref;
      $('.modal').modal('hide');
      modalYield = Batman.DOM.Yield.get('yields.modal');
      if ((_ref = modalYield.get('contentView')) != null) {
        _ref.die();
      }
      return modalYield.set('contentView', void 0);
    };

    ApplicationController.beforeAction(ApplicationController.prototype.closeDialog);

    ApplicationController.prototype.keyboardShortcuts = function() {
      return this.dialog({
        source: "keyboard_shortcuts"
      });
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

    AvatarsController.prototype.edit = function(params) {
      this.render(false);
      return App.Avatar.find(params.id, (function(_this) {
        return function(err, record) {
          _this.set('avatar', record);
          return _this.render();
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
          _this.set('component', record.transaction());
          return _this.render();
        };
      })(this));
      return this.render(false);
    };

    ComponentsController.accessor('componentGroups', function() {
      return App.Component.get('all').inGroupsOf(4);
    });

    return ComponentsController;

  })(App.ApplicationController);

  App.AvatarCanvasView = (function(_super) {
    __extends(AvatarCanvasView, _super);

    function AvatarCanvasView() {
      return AvatarCanvasView.__super__.constructor.apply(this, arguments);
    }

    AvatarCanvasView.prototype.KEY_SENSITIVITY = 3;

    AvatarCanvasView.prototype._checkForChanges = function() {
      $(window).on("beforeunload", this._beforeUnload = (function(_this) {
        return function() {
          if (_this.get('wasChanged')) {
            return "Your changes won't be saved!";
          } else {
            return void 0;
          }
        };
      })(this));
      this._oldRedirect = Batman.redirect;
      return Batman.redirect = (function(_this) {
        return function() {
          var msg;
          if ((msg = _this._beforeUnload()) && !confirm("" + msg + " \nAre you sure you want to leave this page?")) {
            return console.log("Navigation prevented", msg);
          } else {
            return _this._oldRedirect.apply(Batman, arguments);
          }
        };
      })(this);
    };

    AvatarCanvasView.prototype.viewWillDisappear = function() {
      console.log("restoring Batman.redirect");
      return Batman.redirect = this._oldRedirect;
    };

    AvatarCanvasView.prototype.viewDidAppear = function() {
      var tool;
      if (this.canvas != null) {
        return;
      }
      this.scope = new paper.PaperScope;
      this.canvas = $(this.node).find('canvas')[0];
      this.scope.setup(this.canvas);
      tool = new Tool;
      this._checkForChanges();
      tool.onMouseDown = (function(_this) {
        return function(e) {
          return _this.onMouseDown(e);
        };
      })(this);
      tool.onMouseDrag = (function(_this) {
        return function(e) {
          return _this.onMouseDrag(e);
        };
      })(this);
      return tool.onKeyDown = (function(_this) {
        return function(e) {
          var handler;
          if (handler = _this.KEY_HANDLERS[e.key]) {
            return handler.call(_this);
          } else {
            return console.log(e.key);
          }
        };
      })(this);
    };

    AvatarCanvasView.prototype.onMouseDown = function(e) {
      var currentItem, item, _i, _len, _ref, _results;
      $('input, select').blur();
      if (e.item == null) {
        return;
      }
      currentItem = this.get('currentItem');
      if (this._testItem(e.item, e.point)) {
        return this.set('currentItem', e.item);
      } else if ((currentItem != null) && this._testItem(currentItem, e.point)) {

      } else {
        _ref = this.scope.project.activeLayer.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if (this._testItem(item, e.point)) {
            this.set('currentItem', item);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    AvatarCanvasView.prototype.onMouseDrag = function(e) {
      if (e.delta != null) {
        this.moveBy(e.delta.x, e.delta.y);
        return this.canvasWasChanged();
      }
    };

    AvatarCanvasView.prototype._testItem = function(item, point) {
      var targetItemTest;
      if (item.dontSelect) {
        return false;
      }
      targetItemTest = item.hitTest(point, {
        fill: true
      });
      return (targetItemTest != null) && targetItemTest.color.alpha !== 0;
    };

    AvatarCanvasView.prototype.moveBy = function(x, y) {
      var lastPostion, newPosition, _ref, _ref1;
      if (!(lastPostion = (_ref = this.get('currentItem')) != null ? _ref.position : void 0)) {
        return;
      }
      newPosition = [lastPostion.x + x, lastPostion.y + y];
      if ((_ref1 = this.get('currentItem')) != null) {
        _ref1.position = newPosition;
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.zoomOut = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.scale(0.9);
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.zoomIn = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.scale(1.1);
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.rotateLeft = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.rotate(-5);
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.rotateRight = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.rotate(5);
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.sendToBack = function() {
      var item;
      if (!(item = this.get('currentItem'))) {
        return;
      }
      item.sendToBack();
      item.feature.set('index', item.index);
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.bringToFront = function() {
      var item;
      if (!(item = this.get('currentItem'))) {
        return;
      }
      item.bringToFront();
      item.feature.set('index', item.index);
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.canvasWasChanged = function() {
      paper.view.draw();
      return this.set('wasChanged', true);
    };

    AvatarCanvasView.prototype._showGrid = function() {
      this._xGrid || (this._xGrid = paper.Path.Line([0, 150], [300, 150]));
      this._xGrid.strokeColor = "black";
      this._yGrid || (this._yGrid = paper.Path.Line([150, 0], [150, 300]));
      this._yGrid.strokeColor = "black";
      return paper.view.draw();
    };

    AvatarCanvasView.prototype.KEY_HANDLERS = {
      up: function() {
        return this.moveBy(0, -this.KEY_SENSITIVITY);
      },
      down: function() {
        return this.moveBy(0, this.KEY_SENSITIVITY);
      },
      left: function() {
        return this.moveBy(-this.KEY_SENSITIVITY, 0);
      },
      right: function() {
        return this.moveBy(this.KEY_SENSITIVITY, 0);
      },
      backspace: function() {
        if (document.activeElement.tagName.toUpperCase() === "BODY") {
          this.remove();
          return false;
        }
      },
      "-": function() {
        return this.zoomOut();
      },
      "_": function() {
        return this.zoomOut();
      },
      "+": function() {
        return this.zoomIn();
      },
      "=": function() {
        return this.zoomIn();
      },
      "<": function() {
        return this.rotateLeft();
      },
      ">": function() {
        return this.rotateRight();
      }
    };

    return AvatarCanvasView;

  })(Batman.View);

  App.ComponentsEditView = (function(_super) {
    __extends(ComponentsEditView, _super);

    function ComponentsEditView() {
      return ComponentsEditView.__super__.constructor.apply(this, arguments);
    }

    ComponentsEditView.prototype.viewDidAppear = function() {
      var background;
      ComponentsEditView.__super__.viewDidAppear.apply(this, arguments);
      background = new paper.Raster("http://localhost:9000/images/avatar_background.png", paper.view.center);
      background.dontSelect = true;
      this.addFeature(this.controller.get('component'));
      return this.set('wasChanged', false);
    };

    ComponentsEditView.prototype.addFeature = function(component) {
      var imageDataURI, raster, x, y, _ref;
      imageDataURI = component.get('imageDataURI');
      _ref = paper.view.center, x = _ref.x, y = _ref.y;
      raster = new paper.Raster(imageDataURI, [component.get('defaultX') || x, component.get('defaultY') || y]);
      raster.scale(component.get('defaultScale') || 1);
      return this.set('currentItem', raster);
    };

    ComponentsEditView.prototype.canvasWasChanged = function() {
      var newAttrs;
      ComponentsEditView.__super__.canvasWasChanged.apply(this, arguments);
      newAttrs = {
        defaultX: this.get("currentItem").position.x,
        defaultY: this.get("currentItem").position.y,
        defaultScale: this.get('currentItem').scaling.x
      };
      return this.controller.get('component').updateAttributes(newAttrs);
    };

    ComponentsEditView.prototype.saveComponent = function() {
      this.set('saveMessage', "Saving...");
      return this.controller.get('component').save((function(_this) {
        return function() {
          _this.unset('wasChanged');
          return _this.unset('saveMessage');
        };
      })(this));
    };

    return ComponentsEditView;

  })(App.AvatarCanvasView);

  App.AvatarsFormView = (function(_super) {
    __extends(AvatarsFormView, _super);

    function AvatarsFormView() {
      AvatarsFormView.__super__.constructor.apply(this, arguments);
      this.set('selectedComponentId', null);
      this.observe('selectedComponent', (function(_this) {
        return function(nv, ov) {
          if (nv != null) {
            console.log("adding component", nv);
            return _this.addFeature(nv);
          }
        };
      })(this));
    }

    AvatarsFormView.accessor('selectedComponent', function() {
      return App.Component.get('loaded.indexedByUnique.id').get(this.get('selectedComponentId'));
    });

    AvatarsFormView.prototype.viewDidAppear = function() {
      AvatarsFormView.__super__.viewDidAppear.apply(this, arguments);
      return this.loadAvatar();
    };

    AvatarsFormView.prototype.canvasWasChanged = function() {
      AvatarsFormView.__super__.canvasWasChanged.apply(this, arguments);
      return this.controller.get('avatar').set('imageDataURI', this.canvas.toDataURL());
    };

    AvatarsFormView.prototype.addFeature = function(component) {
      var feature, imageDataURI, index, name, raster, x, y, _ref;
      imageDataURI = component.get('imageDataURI');
      name = component.get('name');
      _ref = paper.view.center, x = _ref.x, y = _ref.y;
      raster = new paper.Raster(imageDataURI, [component.get('defaultX') || x, component.get('defaultY') || y]);
      raster.scale(component.get('defaultScale') || 1);
      index = raster.index;
      feature = this.controller.get('avatar.features').build({
        name: name,
        imageDataURI: imageDataURI,
        x: x,
        y: y,
        scale: 1,
        raster: raster,
        index: index
      });
      raster.feature = feature;
      this.set('currentItem', raster);
      this.unset('selectedComponentId');
      return this.canvasWasChanged();
    };

    AvatarsFormView.prototype.moveBy = function(x, y) {
      var lastPostion, newPosition, _ref, _ref1;
      if (!(lastPostion = (_ref = this.get('currentItem')) != null ? _ref.position : void 0)) {
        return;
      }
      newPosition = [lastPostion.x + x, lastPostion.y + y];
      if ((_ref1 = this.get('currentItem')) != null) {
        _ref1.position = newPosition;
      }
      return this.canvasWasChanged();
    };

    AvatarsFormView.prototype.activateFeature = function(feature) {
      return this.set('currentItem', feature.get('raster'));
    };

    AvatarsFormView.prototype.remove = function() {
      var raster;
      if (!(raster = this.get('currentItem'))) {
        return;
      }
      this.controller.get('avatar.features').remove(raster.feature);
      raster.remove();
      this.unset('currentItem');
      return this.canvasWasChanged();
    };

    AvatarsFormView.prototype.removeFeature = function(feature) {
      var raster;
      raster = feature.get('raster');
      this.controller.get('avatar.features').remove(feature);
      if (raster === this.get('currentItem')) {
        this.unset('currentItem');
      }
      raster.remove();
      return this.canvasWasChanged();
    };

    AvatarsFormView.prototype.downloadAvatar = function() {
      var link, uri;
      uri = this.controller.get('avatar.imageDataURI');
      link = document.createElement("a");
      link.download = "avatar.png";
      link.href = uri;
      return link.click();
    };

    AvatarsFormView.prototype.saveAvatar = function() {
      var avatar;
      this.set('saveMessage', "Saving...");
      avatar = this.controller.get('avatar');
      avatar.get('features').forEach(function(f) {
        return f.updateFromRaster();
      });
      return avatar.save((function(_this) {
        return function() {
          _this.set('wasChanged', false);
          return _this.unset('saveMessage');
        };
      })(this));
    };

    AvatarsFormView.prototype.loadAvatar = function() {
      var avatar;
      avatar = this.controller.get('avatar');
      return avatar.get('features.sortedBy.index').forEach(function(f) {
        var raster;
        return raster = f.generateRaster(paper);
      });
    };

    return AvatarsFormView;

  })(App.AvatarCanvasView);

}).call(this);

Batman.View.store.set('/keyboard_shortcuts', '<div class=\"modal-body\"><ul class=\"list-unstyled\"><li>Up</li><li>Down</li><li>Left</li><li>Right</li><li>Backspace: delete</li><li>< Rotate Left</li><li>> Rotate right</li><li>+ Zoom In</li><li>- Zoom Out</li></ul></div><div class=\"modal-footer\"><button type=\"button\" data-event-click=\"closeDialog\" class=\"btn btn-default btn btn-default\">Close</button></div>');
Batman.View.store.set('/avatars/edit', '<div data-partial=\"avatars/form\"></div>');
Batman.View.store.set('/avatars/form', '<div data-view=\"AvatarsFormView\" class=\"avatar-container\"><div class=\"row\"><div class=\"col-sm-12\"><ul data-showif=\"avatar.errors.length\" class=\"list-unstyled alert alert-warning\"><li data-foreach-e=\"avatar.errors\" data-bind=\"e.fullMessage\"></li></ul></div></div><div class=\"row avatar-controls\"><div class=\"col-sm-4\"><div class=\"form-group\"><input type=\"text\" placeholder=\"Who is this?\" data-bind=\"avatar.name\" class=\"form-control\"/></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><select data-bind=\"selectedComponentId\" class=\"form-control\"><option>Select a Component</option><option data-foreach-component=\"Component.all\" data-bind=\"component.name\" data-bind-value=\"component.id\"></option></select></div></div></div><div class=\"row avatar-row\"><div class=\"col-sm-6\"><div class=\"well well-small\"><canvas id=\"new-avatar\" style=\"height:300px; width:300px; border: 1px solid black; cursor:pointer;\"></canvas></div></div><div class=\"col-sm-6\"><div class=\"row\"><div class=\"col-sm-6\"><h3><span>Active Feature:&nbsp;</span><br/><small data-bind=\"currentItem.feature.name\"></small></h3><div style=\"height:100px;\" class=\"img-container\"><img style=\"max-height:100px\" data-bind-src=\"currentItem.feature.imageDataURI\"/></div></div><div class=\"col-sm-6\"><h4>Your Features:</h4><ul class=\"list-unstyled\"><li data-foreach-feature=\"avatar.features.sortedByDescending.index\"><a data-bind=\"feature.name\" data-event-click=\"activateFeature | withArguments feature\"></a><a data-event-click=\"removeFeature | withArguments feature\" class=\"text-danger pull-right\">&times;</a></li></ul></div></div><div class=\"row item-controls\"><div class=\"col-sm-3\"><a data-event-click=\"zoomIn\"><span class=\"icon-zoom-in\"></span></a></div><div class=\"col-sm-3\"><a data-event-click=\"zoomOut\"><span class=\"icon-zoom-out\"></span></a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateLeft\"><span class=\"icon-rotate-left\"></span></a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateRight\"><span class=\"icon-rotate-right\"></span></a></div></div><br/><div class=\"row item-btn-controls\"><div class=\"col-sm-6\"><a data-event-click=\"bringToFront\" class=\"btn btn-primary\">Bring to Front</a></div><div class=\"col-sm-6\"><a data-event-click=\"sendToBack\" class=\"btn btn-primary\">Send to Back</a></div></div></div></div><div class=\"row\"><div class=\"col-sm-4\"><a data-event-click=\"downloadAvatar\" class=\"btn btn-primary\">Download Avatar</a></div><div class=\"col-sm-4\"><a data-event-click=\"executeAction | withArguments &quot;keyboardShortcuts&quot;\" class=\"btn btn-info\">Keyboard Shortcuts</a></div></div></div>');
Batman.View.store.set('/avatars/index', '<div class=\"row\"><div data-foreach-avatar=\"avatars\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"avatar.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"avatar.name\"></p><p><a data-event-click=\"destroy | withArguments avatar\" class=\"btn btn-danger\">Delete</a><a data-route=\"routes.avatars[avatar].edit\" class=\"btn btn-primary\">Edit</a></p></div></div></div></div>');
Batman.View.store.set('/avatars/new', '<div data-partial=\"avatars/form\"></div>');
Batman.View.store.set('/components/edit', '<div data-partial=\"components/form\"></div>');
Batman.View.store.set('/components/form', '<form data-formfor-c=\"component\" data-event-submit=\"saveComponent\"><div class=\"row\"><div data-showif=\"c.errors.length\" class=\"alert alert-danger\"><ul class=\"list-unstyled\"><li data-foreach-error=\"c.errors\" data-bind=\"error.fullMessage\"></li></ul></div></div><div class=\"row\"><div class=\"col-xs-6\"><div class=\"well\"><div style=\"height:200px;width:100%\" class=\"img-container\"><p data-showif=\"c.imageDataURI | not\">Upload an image to see a preview!</p><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"c.imageDataURI\"/></div></div></div><div class=\"col-xs-6\"><div class=\"well well-small\"><canvas id=\"new-avatar\" style=\"height:300px; width:300px; border: 1px solid black; cursor:pointer;\"></canvas></div></div></div><div class=\"row\"><div class=\"form-group col-xs-6\"><label>Name</label><input type=\"text\" data-bind=\"c.name\" placeholder=\"name\" class=\"form-control\"/></div><div class=\"form-group col-xs-6\"><a data-event-click=\"executeAction | withArguments &quot;keyboardShortcuts&quot;\" class=\"btn btn-info\">Keyboard Shortcuts</a><br/><label>Default Position:</label><div class=\"row\"><div class=\"col-xs-3\"><input type=\"text\" disabled=\"true\" data-bind=\"component.defaultX\" class=\"form-control\"/></div><div class=\"col-xs-3\"><input type=\"text\" disabled=\"true\" data-bind=\"component.defaultY\" class=\"form-control\"/></div><div class=\"col-xs-3\"><input type=\"text\" disabled=\"true\" data-bind=\"component.defaultScale\" class=\"form-control\"/></div></div></div></div><div class=\"row\"><div class=\"form-group col-xs-6\"><label>Type</label><select data-bind=\"component.type\" class=\"form-control\"><option data-foreach-t=\"Component.TYPES\" data-bind=\"t\" data-bind-value=\"t\"></option></select></div><div class=\"form-group col-xs-6\"><label>File</label><input type=\"file\" data-bind=\"c.imageFile\" class=\"form-control\"/></div></div><div class=\"row\"><div class=\"form-group col-xs-6\"><label>Description</label><textarea data-bind=\"c.description\" placeholder=\"description\" class=\"form-control\"></textarea></div></div><div class=\"row\"><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-4\"><input data-addclass-btn-warning=\"wasChanged\" type=\"submit\" data-bind-value=\"saveMessage | default &quot;Save Component&quot;\" class=\"btn btn-primary\"/></div><div class=\"col-xs-4\"><a data-event-click=\"destroy | withArguments component\" data-showif=\"component.isNew | not\" class=\"btn btn-danger\">Delete</a></div></div></div></div></form>');
Batman.View.store.set('/components/index', '<div class=\"row\"><div class=\"col-sm-6\"><h1 class=\"page-header\">Components</h1></div></div><div class=\"row\"><div class=\"col-sm-3 col-sm-offset-9\"><a data-route=\"routes.components.new\" class=\"btn btn-primary\">New Component</a></div></div><div data-foreach-group=\"componentGroups\" class=\"row\"><div data-foreach-component=\"group\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"component.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"component.name\"></p><a data-route=\"routes.components[component].edit\" class=\"btn btn-primary\">Edit</a><a data-event-click=\"destroy | withArguments component\" class=\"btn btn-danger\">Destroy</a></div></div></div></div>');
Batman.View.store.set('/components/new', '<div data-partial=\"components/form\"></div>');