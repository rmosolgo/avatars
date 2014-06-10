Batman.View.store.set('/avatars/index', '<div class=\"row\"><div data-foreach-avatar=\"avatars\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"avatar.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"avatar.name\"></p><p><a data-event-click=\"destroy | withArguments avatar\" class=\"btn btn-danger\">Delete</a></p></div></div></div></div>');
Batman.View.store.set('/avatars/new', '<div class=\"row\"><div class=\"col-sm-12\"><ul data-showif=\"avatar.errors.length\" class=\"list-unstyled alert alert-warning\"><li data-foreach-e=\"avatar.errors\" data-bind=\"e.fullMessage\"></li></ul></div></div><div class=\"row\"><div class=\"col-sm-4\"><div class=\"form-group\"><input type=\"text\" placeholder=\"Who is this?\" data-bind=\"avatar.name\" class=\"form-control\"/></div></div><div class=\"col-sm-4\"><div class=\"form-group\"><select data-bind=\"selectedComponentId\" class=\"form-control\"><option>Select a Component</option><option data-foreach-component=\"Component.all\" data-bind=\"component.name\" data-bind-value=\"component.id\"></option></select></div></div></div><div class=\"row\"><div class=\"col-sm-6\"><div class=\"well well-small\"><canvas id=\"new-avatar\" style=\"height:300px; width:300px; border: 1px solid black; cursor:pointer;\"></canvas></div></div><div class=\"col-sm-6\"><div class=\"row\"><h3>Selected Component</h3><div style=\"height:100px;\" class=\"img-container\"><img style=\"max-height:100px\" data-bind-src=\"currentItem.component.imageDataURI\"/></div></div><div class=\"row\"><div class=\"col-sm-3\"><a data-event-click=\"zoomIn\" class=\"btn btn-primary\">Zoom In</a></div><div class=\"col-sm-3\"><a data-event-click=\"zoomOut\" class=\"btn btn-primary\">Zoom Out</a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateLeft\" class=\"btn btn-primary\">Rotate Left</a></div><div class=\"col-sm-3\"><a data-event-click=\"rotateRight\" class=\"btn btn-primary\">Rotate Right</a></div></div><br/><div class=\"row\"><div class=\"col-sm-3\"><a data-event-click=\"bringToFront\" class=\"btn btn-primary\">Bring to Front</a></div><div class=\"col-sm-3\"><a data-event-click=\"sendToBack\" class=\"btn btn-primary\">Send to Back</a></div><div class=\"col-sm-3\"><a data-event-click=\"remove\" class=\"btn btn-danger\">Remove</a></div></div></div></div><div class=\"row\"><div class=\"col-md-2\"><a data-event-click=\"downloadAvatar\" class=\"btn btn-primary\">Download Avatar</a></div><div class=\"col-sm-2\">All finished?<a data-event-click=\"save\" class=\"btn btn-success\">Save Avatar</a></div></div>');
Batman.View.store.set('/components/edit', '<div data-partial=\"components/form\"></div>');
Batman.View.store.set('/components/form', '<form data-formfor-c=\"component\" data-event-submit=\"save | withArguments component\"><div class=\"row\"><div data-showif=\"c.errors.length\" class=\"alert alert-danger\"><ul class=\"list-unstyled\"><li data-foreach-error=\"c.errors\" data-bind=\"error.fullMessage\"></li></ul></div></div><div class=\"row\"><div class=\"well\"><div style=\"height:200px;width:100%\" class=\"img-container\"><p data-showif=\"c.imageDataURI | not\">Upload an image to see a preview!</p><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"c.imageDataURI\"/></div></div></div><div class=\"row\"><div class=\"form-group\"><label>Name</label><input type=\"text\" data-bind=\"c.name\" placeholder=\"name\" class=\"form-control\"/></div><div class=\"form-group\"><label>File</label><input type=\"file\" data-bind=\"c.imageFile\" class=\"form-control\"/></div><div class=\"form-group\"><label>Description</label><textarea data-bind=\"c.description\" placeholder=\"description\" class=\"form-control\"></textarea></div><div class=\"form-group\"><div class=\"row\"><div class=\"col-xs-4\"><input type=\"submit\" value=\"Save\" class=\"btn btn-primary\"/></div><div class=\"col-xs-4\"><a data-event-click=\"destroy | withArguments component\" data-showif=\"component.isNew | not\" class=\"btn btn-danger\">Delete</a></div></div></div></div></form>');
Batman.View.store.set('/components/index', '<div class=\"row\"><div class=\"col-sm-6\"><h1 class=\"page-header\">Components</h1></div></div><div class=\"row\"><div class=\"col-sm-3 col-sm-offset-9\"><a data-route=\"routes.components.new\" class=\"btn btn-primary\">New Component</a></div></div><div data-foreach-group=\"componentGroups\" class=\"row\"><div data-foreach-component=\"group\" class=\"col-sm-3\"><div class=\"thumbnail\"><div style=\"height:200px;width:100%\" class=\"img-container\"><img style=\"max-height:100%; max-width:100%\" data-bind-src=\"component.imageDataURI\"/></div><div class=\"caption\"><p data-bind=\"component.name\"></p><a data-route=\"routes.components[component].edit\" class=\"btn btn-primary\">Edit</a><a data-event-click=\"destroy | withArguments component\" class=\"btn btn-danger\">Destroy</a></div></div></div></div>');
Batman.View.store.set('/components/new', '<div data-partial=\"components/form\"></div>');