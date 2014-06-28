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

    Avatar.hasOne('body', {
      name: "Feature",
      saveInline: true
    });

    Avatar.hasOne('head', {
      name: "Feature",
      saveInline: true
    });

    Avatar.hasOne('mouth', {
      name: "Feature",
      saveInline: true
    });

    Avatar.hasOne('nose', {
      name: "Feature",
      saveInline: true
    });

    Avatar.hasOne('eyes', {
      name: "Feature",
      saveInline: true
    });

    Avatar.hasOne('hair', {
      name: "Feature",
      saveInline: true
    });

    Avatar.validate('name', {
      presence: true
    });

    Avatar.validate('imageDataURI', {
      presence: true
    });

    Avatar.belongsToCurrentUser();

    Avatar.makeTemplate = function() {
      var avatar, component, feature, type, _i, _len, _ref;
      avatar = new this;
      _ref = App.Component.TYPES;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        component = App.Component.get('all.indexedBy.type').get(type).get('first');
        feature = App.Feature.fromComponent(component);
        avatar.set(type, feature);
      }
      return avatar;
    };

    return Avatar;

  })(Batman.Model);

  App.Component = (function(_super) {
    __extends(Component, _super);

    Component.resourceName = 'component';

    Component.persist(BatFire.Storage);

    Component.TYPES = ["body", "head", "mouth", "nose", "eyes", "hair"];

    Component.encode('imageDataURI', 'name', 'description', 'type', 'defaultX', 'defaultY', 'defaultScale');

    Component.validate('imageDataURI', {
      presence: true
    });

    Component.validate('name', {
      presence: true
    });

    Component.validate('type', {
      presence: true
    });

    Component.validate('defaultX', function(errors, record, attribute, callback) {
      if (!(record.get('defaultX') && record.get('defaultY'))) {
        errors.add("base", "You must provide a default position!");
      }
      return callback();
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

    Component.prototype.generateRaster = function(paperObj) {
      var imageDataURI, raster, x, y, _ref;
      imageDataURI = this.get('imageDataURI');
      _ref = paperObj.view.center, x = _ref.x, y = _ref.y;
      raster = new paperObj.Raster(imageDataURI, [this.get('defaultX') || x, this.get('defaultY') || y]);
      return raster.scale(this.get('defaultScale') || 1);
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

    Feature.encode('name', 'imageDataURI', 'x', 'y', 'scale', 'rotation', 'index', 'type');

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

    Feature.fromComponent = function(component) {
      var defaultScale, defaultX, defaultY, feature, imageDataURI, name, type, _ref;
      _ref = component.toJSON(), imageDataURI = _ref.imageDataURI, name = _ref.name, type = _ref.type, defaultScale = _ref.defaultScale, defaultX = _ref.defaultX, defaultY = _ref.defaultY;
      return feature = new this({
        imageDataURI: imageDataURI,
        name: name,
        type: type,
        scale: defaultScale,
        x: defaultX,
        y: defaultY
      });
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
      if (!confirm("Are you sure you want to delete this " + (Batman.helpers.singularize(Batman.helpers.humanize(this.get('routingKey')))) + "?")) {
        return;
      }
      if (!(typeof callback === "function")) {
        callback = (function(_this) {
          return function() {
            return _this.redirect({
              action: "index"
            });
          };
        })(this);
      }
      return obj.destroy((function(_this) {
        return function(err, record) {
          if (err != null) {
            throw err;
          } else {
            return callback(err, record);
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
      this.render(false);
      return App.Component.load((function(_this) {
        return function() {
          _this.set('avatar', App.Avatar.makeTemplate());
          return _this.render();
        };
      })(this));
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
      return App.Component.load((function(_this) {
        return function() {
          return App.Avatar.find(params.id, function(err, record) {
            _this.set('avatar', record);
            return _this.render();
          });
        };
      })(this));
    };

    AvatarsController.prototype.show = function(params) {
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

    AvatarCanvasView.prototype.KEY_SENSITIVITY = 1;

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
      $(window).off("beforeunload", this._beforeUnload);
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
        _ref.scale(0.95);
      }
      return this.canvasWasChanged();
    };

    AvatarCanvasView.prototype.zoomIn = function() {
      var _ref;
      if ((_ref = this.get('currentItem')) != null) {
        _ref.scale(1.05);
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

  App.AvatarsFormView = (function(_super) {
    __extends(AvatarsFormView, _super);

    function AvatarsFormView() {
      var type, _i, _len, _ref;
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
      this._typeIds = {};
      _ref = App.Component.TYPES;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        type = _ref[_i];
        this._typeIds[type] = {
          current: 0,
          ids: App.Component.get('loaded').indexedBy('type').get(type).sortedBy('name').mapToProperty('id')
        };
      }
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
      return this._updateAvatar();
    };

    AvatarsFormView.prototype._updateAvatar = function() {
      return this.controller.get('avatar').set('imageDataURI', this.canvas.toDataURL());
    };

    AvatarsFormView.prototype.nextForType = function(type) {
      var index, typeHash;
      typeHash = this._typeIds[type];
      index = ++typeHash.current;
      if (index === typeHash.ids.length) {
        index = typeHash.current = 0;
      }
      console.log(index, typeHash.current);
      return this.replaceTypeFromIndex(type, index);
    };

    AvatarsFormView.prototype.prevForType = function(type) {
      var index, typeHash;
      typeHash = this._typeIds[type];
      index = --typeHash.current;
      if (index === -1) {
        index = typeHash.current = typeHash.ids.length - 1;
      }
      console.log(index, typeHash.current);
      return this.replaceTypeFromIndex(type, index);
    };

    AvatarsFormView.prototype.replaceTypeFromIndex = function(type, index) {
      var component, componentId, feature, prevFeature, prevRaster, rasterIndex;
      componentId = this._typeIds[type].ids[index];
      component = App.Component.get('loaded').indexedByUnique('id').get(componentId);
      prevFeature = this.controller.get('avatar').get(type);
      prevRaster = prevFeature.get('raster');
      rasterIndex = prevRaster.index;
      prevRaster.remove();
      this.controller.get('avatar').unset(type);
      feature = this.addFeatureAsType(component, type, {
        index: rasterIndex
      });
      return this.set('currentItem', feature.get('raster'));
    };

    AvatarsFormView.prototype.addFeatureAsType = function(component, type, options) {
      var avatar, feature, raster;
      if (options == null) {
        options = {};
      }
      raster = component.generateRaster(paper);
      if (options.index != null) {
        paper.project.activeLayer.insertChild(options.index, raster);
      }
      feature = this._addFeature(component);
      avatar = this.controller.get('avatar');
      avatar.set(type, feature);
      return feature;
    };

    AvatarsFormView.prototype._addFeature = function(component) {
      var avatar, feature, index, raster;
      raster = component.generateRaster(paper);
      avatar = this.controller.get('avatar');
      index = raster.index;
      feature = App.Feature.fromComponent(component);
      feature.updateAttributes({
        raster: raster,
        index: index,
        avatar: avatar
      });
      raster.feature = feature;
      this.set('currentItem', raster);
      return this.canvasWasChanged();
    };

    AvatarsFormView.prototype.addFeature = function(component) {
      var feature;
      feature = this._addFeature(component);
      this.controller.get('avatar.features').add(feature);
      this.unset('selectedComponentId');
      return feature;
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
      var avatar, feature, type, _i, _len, _ref;
      avatar = this.controller.get('avatar');
      if (avatar.get('features.length')) {
        avatar.get('features.sortedBy.index').forEach(function(f) {
          var raster;
          return raster = f.generateRaster(paper);
        });
      } else {
        _ref = App.Component.TYPES;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          type = _ref[_i];
          feature = avatar.get("" + type);
          if (feature.isProxy) {
            feature = feature.get('target');
          }
          if (feature != null) {
            feature.generateRaster(paper);
          }
        }
      }
      this.canvasWasChanged();
      return this.set('wasChanged', false);
    };

    return AvatarsFormView;

  })(App.AvatarCanvasView);

  App.ComponentsEditView = (function(_super) {
    __extends(ComponentsEditView, _super);

    function ComponentsEditView() {
      return ComponentsEditView.__super__.constructor.apply(this, arguments);
    }

    ComponentsEditView.prototype.viewDidAppear = function() {
      var background;
      ComponentsEditView.__super__.viewDidAppear.apply(this, arguments);
      background = new paper.Raster("" + window.location.origin + "/images/avatar_background.png", paper.view.center);
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
        return function(e, r) {
          _this.unset('saveMessage');
          if (e != null) {
            if (!(e instanceof Batman.ErrorsSet)) {
              throw e;
            }
          } else {
            _this.unset('wasChanged');
            return _this.controller.redirect({
              action: "index"
            });
          }
        };
      })(this));
    };

    return ComponentsEditView;

  })(App.AvatarCanvasView);

}).call(this);
