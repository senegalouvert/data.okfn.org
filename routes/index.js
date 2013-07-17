var fs = require('fs')
  , request = require('request')
  , marked = require('marked')
  , csv = require('csv')

  , tools = require('../tools.js')
  , model = require('../model.js')
  ;

var catalog = new model.Catalog();
exports.catalog = catalog;
// ========================================================
// Core content
// ========================================================

exports.home = function(req, res) {
  res.render('index.html', {
  });
};

exports.about = function(req, res) {
  res.render('about.html', {});
};

exports.contribute = function(req, res) {
  res.render('contribute.html', {});
};

exports.standards = function(req, res) {
  res.render('/standards/index.html', {});
};

exports.standardsDataPackage = function(req, res) {
  fs.readFile('templates/standards/data-package.md', 'utf8', function(err, text) {
    var content = marked(text);
    res.render('base.html', {
      title: 'Data Package - Standards',
      content: content
    });
  });
};

exports.standardsSimpleDataFormat = function(req, res) {
  fs.readFile('templates/standards/simple-data-format.md', 'utf8', function(err, text) {
    var content = marked(text);
    res.render('base.html', {
      title: 'Simple Data Format - Standards',
      content: content
    });
  });
};

// ========================================================
// Tools
// ========================================================

exports.tools = function(req, res) {
  res.render('/tools/index.html', {});
};

// /tools/creator.json?name=abc&title=
exports.toolsDpCreateJSON = function(req, res) {
  var out = {};
  out.name = req.query.name || ''; 
  out.title = req.query.title || '';
  out.description = req.query.description || '';
  out.licenses = [{
      'id': 'odc-pddl',
      'name': 'Public Domain Dedication and License',
      'version': '1.0',
      'url': 'http://opendatacommons.org/licenses/pddl/1.0/'
  }];
  out.resources = [];
  if ('url' in req.query || 'resource.url' in req.query) {
    var resurl = req.query['url'] || req.query['resource.url'];
    var tmp = {
      url: resurl
    }
    out.resources.push(tmp);
    var stream = request(resurl);
    var parser = csv();
      parser.from.stream(stream)
          .transform(function(data, idx, callback) {
            if (idx==0) {
              var fields = data.map(function(field) {
                // field.type = field.type in jtsmap ? jtsmap[field.type] : field.type;
                return {
                  id: field,
                  type: 'string'
                }
              });
              out.resources[0].schema = {
                fields: fields
              };
              res.json(out);
              throw new Error('Stop parsing');
            }
            if (idx <= 5) console.log(idx);
          }, {parallel: 1})
        .on('error', function(err) {
          parser.pause();
          // do these for good measure ...
          stream.pause();
          stream.destroy();
          res.send(500, err);
        })
        ;
  } else {
    res.json(out);
  }
};

exports.toolsDpCreate = function(req, res) {
  res.render('tools/dp/create.html');
};

exports.toolsDpValidateJSON = function(req, res) {
  request(req.query.url, function(err, response, body) {
    if (err) {
      res.send(500, err.toString());
    } else {
      var out = tools.dpValidate(body);
      res.json(out);
    }
  });
};

exports.toolsDpView = function(req, res) {
  var url = req.query.url;
  if (!url) {
    res.send('hello world');
  } else {
    tools.load(url, function(err, dpkg) {
      if (err) {
        res.send('<p>There was an error.</p>\n\n' + err.message);
        return;
      }

      if (dpkg.resources && dpkg.resources.length > 0) {
        var resource = dpkg.resources[0];
        resource.backend = 'csv';
        resource.url = '/tools/dataproxy/?url=' + encodeURIComponent(resource.url);
	resource.fields = resource.schema.fields;
      }
      var dataViews = dpkg.views || [];
      res.render('data/dataset.html', {
        dataset: dpkg,
        raw_data_file: JSON.stringify(resource),
        dataViews: JSON.stringify(dataViews)
      });
    });
  }
};

// proxy data
exports.toolsDataProxy = function(req, res) {
  var url = req.query.url;
  request.get(url).pipe(res);
}

// ========================================================
// Data section
// ========================================================

exports.data = function(req, res) {
  datasets = catalog.query();
  total = datasets.length;
  res.render('data/index.html', {
    total: total,
    datasets: datasets
  });
};

exports.dataSearch = function(req, res) {
  q = req.query.q || '';
  // datasets = catalog.query(q)
  datasets = [];
  total = datasets.length;
  res.render('data/search.html', {q: q, datasets: datasets, total: total});
};

exports.dataShowJSON = function(req, res) {
  var id = req.params.id;
  var dataset = catalog.get(id)
  if (!dataset) {
    res.send(404, 'Not Found');
  }
  res.json(dataset);
};

exports.dataShowCSV = function(req, res) {
  var id = req.params.id;
  var dataset = catalog.get(id)
  if (!dataset || !dataset.resources.length > 0) {
    res.send(404, 'Not Found');
  }
  var url = dataset.resources[0].url;
  request.get(url).pipe(res);
};

exports.dataShow = function(req, res) {
  var id = req.params.id;
  var dataset = catalog.get(id)
  if (!dataset) {
    res.send(404, 'Not Found');
  }
  if (dataset.resources && dataset.resources.length > 0) {
    // Get the primary resource for use in JS
    // deep copy and then "fix" in various ways
    var resource = JSON.parse(JSON.stringify(dataset.resources[0]));
    resource.dataset_name = dataset.id;
    //resource.url = '/data/' + id + '.csv';
    //resource.backend = 'csv';
    //Use The dataproxy backend here 
    resource.backend = 'dataproxy'; 
    resource.fields = resource.schema.fields;
  }
  var dataViews = dataset.views || [];
  console.log('test ori' + dataViews[0].state.series );

  res.render('data/dataset.html', {
    dataset: dataset,
    raw_data_file: JSON.stringify(resource),
    dataViews: JSON.stringify(dataViews)
  });
};

exports.dataEmbed = function(req, res) {
  var id = req.params.id;
  var dataset = catalog.get(id)
  if (!dataset) {
    res.send(404, 'Not Found');
  }
  if (dataset.resources && dataset.resources.length > 0) {
    //Get the primary resource for use in JS
    //deep copy and then "fix" in various ways
    var resource = JSON.parse(JSON.stringify(dataset.resources[0]));
    resource.dataset_name = dataset.id;
    //resource.url = '/data/' + id + '.csv';
    //resource.backend = 'csv';
    //Use The dataproxy backend here
    resource.backend = 'dataproxy';
    resource.fields = resource.schema.fields;
  }
  var dataViews = dataset.views || [];
  //check if series params was passed.
  var series = req.params.series || ''
  if(series){
    try {
        //url decoding 
        series = decodeURIComponent(series);
    }catch (e) {
        series = '';
    }
    if (series) {
        //if ',' in series split and parse
        if (series.indexOf(",") >0 ){
            series = series.split(",");
        }else {
            //One serie
	  	series = [series];
	  }
    }
    //create an copy of the dataviews series, we should not moidfy 
    //the original dataviews 
    old =dataViews[0].state.series 
    dataViews[0].state.series =series
  }
  res.render('data/dataembed.html', {
    dataset: dataset,
    raw_data_file: JSON.stringify(resource),
    dataViews: JSON.stringify(dataViews)
  });
   //restore old series
   dataViews[0].state.series  = old;
};
