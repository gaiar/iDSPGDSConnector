/** Define namespace */
var connector = connector || {};


/**
 * Apps Script Cache expiration time (in seconds) for UrlFetch response.
 * @const
 */
connector.cacheExpiration = 1 * 60;

/** @const */
connector.defaultTag = 'google-data-studio';


/** @const */
connector.cacheTag = 'rap-reporting-results';

/** @const */
connector.logEnabled = true;

connector.customConfig = {
  configParams: [{
      'type': 'INFO',
      'name': 'welcomeMessage',
      'text': 'For access please enter your Pull API Token'
    },
    {
      'type': 'TEXTINPUT',
      'name': 'apiToken',
      'displayName': 'Pull API Token',
      'helpText': 'API Token is required',
      'placeholder': 'TOKEN'
    }
  ],
  dateRangeRequired: true
};


/** @const */
connector.pullAPISchema = [

  {
    name: 'date',
    label: 'Date',
    dataType: 'STRING',
    isDefault: true,
    semantics: {
      conceptType: 'DIMENSION',
      semanticGroup: 'DATE_TIME',
      semanticType: 'YEAR_MONTH_DAY'
    }
  },
  {
    name: 'app_name',
    label: 'App name',
    dataType: 'STRING',
    semantics: {
      semanticType: 'TEXT',
      conceptType: 'DIMENSION'
    }
  },
  {
    name: 'campaign_id',
    label: 'Campaign ID',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },

  {
    name: 'campaign_name',
    label: 'Campaign name',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION'
    }
  },

  {
    name: 'campaign_type',
    label: 'Campaign type',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'country',
    label: 'Country',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'os',
    label: 'OS',
    dataType: 'STRING',
    semantics: {
      conceptType: 'DIMENSION',
      semanticType: 'TEXT'
    }
  },
  {
    name: 'clicks',
    label: 'Clicks',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'conversions',
    label: 'Conversions',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticType: 'NUMBER',
      semanticGroup: 'NUMERIC',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'payout',
    label: 'Revenue',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticGroup: 'CURRENCY',
      semanticType: 'CURRENCY_USD',
      isReaggregatable: true
    },
    defaultAggregationType: 'SUM'
  },
  {
    name: 'ecpa',
    label: 'eCPA',
    dataType: 'NUMBER',
    semantics: {
      conceptType: 'METRIC',
      semanticGroup: 'CURRENCY',
      semanticType: 'CURRENCY_USD',
      isReaggregatable: false
    }
  }

];

/**
 * Wrapper function for `connector.getAuthType()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return connector.logAndExecute('getAuthType', null);
}

/**
 * Wrapper function for `connector.getConfig()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */

function getConfig(request) {
  return connector.logAndExecute('getConfig', request);
}

/**
 * Wrapper function for `connector.getConfig()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getSchema(request) {
  return connector.logAndExecute('getSchema', request);
};

/**
 * Wrapper function for `connector.getData()`
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  return connector.logAndExecute('getData', request);
}


/**
 * Wrapper function for `connector.isAdminUser()`
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return connector.logAndExecute('isAdminUser', null);
}


/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @returns {Object} `AuthType` used by the connector.
 */

connector.getAuthType = function() {
  var response = {
    'type': 'NONE'
  };
  return response;
};

/**
 * Returns the user configurable options for the connector.
 *
 * Required function for Community Connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */

connector.getConfig = function(request) {
  var config = connector.customConfig;
  return config;
};

/**
 * Wrapper function for `connector.getSchema()`
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */

connector.getSchema = function(request) {
  return {
    schema: connector.pullAPISchema
  };
};

/**
 * Takes date input in Unix epoch and return in YYYYMMDD format. Returns '' if
 * input is undefined or null.
 *
 * @param {int} date Unix epoch.
 * @returns {string} Date in YYYYMMDD format.
 */
connector.formatDate = function(date) {
  if (!date) {
    return '';
  }
  var dateObj = new Date(date);
  return dateObj.toISOString().slice(0, 10).replace(/-/g, '');
};


/**
 * Gets cached response for UrlFetch. If the response has not been cached, make
 * the UrlFetch call, then cache and return the response.
 *
 * @param {Object} request Data request parameters.
 * @returns {string} The response text for UrlFetch.
 */

connector.getCachedData = function(request) {
  try {
    var cache = connector.ChunkyCache(CacheService.getUserCache(), 1024 * 90);
    var cacheKey = request.configParams.apiToken + request.dateRange.startDate + request.dateRange.endDate;
    var cachedData = cache.get(cacheKey);
    console.log('cacheKey',cacheKey);
  } catch (e) {
    console.error('Unable to create cache',e);
  }


  if (cachedData != null) {
    var sourceData = cachedData;
    console.log('Using cache');
  } else {

    var url = [
      'https://pull.applift.com/reports/',
      request.configParams.apiToken,
      '?from=',
      request.dateRange.startDate,
      '&to=',
      request.dateRange.endDate
    ];
    url = url.join('');
    try {
      var response = UrlFetchApp.fetch(url);
      console.log('CSV result', response.getResponseCode());

      var csvData = Utilities.parseCsv(response, ',');
      var sourceData = connector.csvToObject(csvData);

      cache.put(cacheKey, sourceData, connector.cacheExpiration);
    } catch (e) {
      console.error('Fetching CSV', e);
      connector.throwError('Unable to get data from Reporting API', true);
    }
  }
  return sourceData;
};

connector.ChunkyCache = function(cache, chunkSize) {
  return {
    put: function(key, value, timeout) {
      var json = JSON.stringify(value);
      var cSize = Math.floor(chunkSize / 2);
      var chunks = [];
      var index = 0;
      while (index < json.length) {
        cKey = key + "_" + index;
        chunks.push(cKey);
        cache.put(cKey, json.substr(index, cSize), timeout + 5);
        index += cSize;
      }

      var superBlk = {
        chunkSize: chunkSize,
        chunks: chunks,
        length: json.length
      };
      cache.put(key, JSON.stringify(superBlk), timeout);
    },
    get: function(key) {
      var superBlkCache = cache.get(key);
      if (superBlkCache != null) {
        var superBlk = JSON.parse(superBlkCache);
        chunks = superBlk.chunks.map(function(cKey) {
          return cache.get(cKey);
        });
        if (chunks.every(function(c) {
            return c != null;
          })) {
          return JSON.parse(chunks.join(''));
        }
      }
    }
  };
};

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */

connector.getData = function(request) {
  var dataSchema = [];
  request.fields.forEach(function(field) {
    for (var i = 0; i < connector.pullAPISchema.length; i++) {
      if (connector.pullAPISchema[i].name === field.name) {
        dataSchema.push(connector.pullAPISchema[i]);
        break;
      }
    }
  });

  var sourceData = connector.getCachedData(request);
  // try {
  //   var csvData = Utilities.parseCsv(responseString, ',');
  //   var sourceData = connector.csvToObject(csvData);
  //   console.log('sourceData', sourceData.length);
  // } catch (e) {
  //   console.log(e);
  //   console.error('Parsing CSV', e);
  //   connector.throwError('Unable to fetch data from source', true);
  // }

  var data = [];

  sourceData.forEach(function(row) {
    var values = [];
    dataSchema.forEach(function(field) {
      var key = field.name;
      if (key == 'date') {
        values.push(connector.formatDate(row[key]));
      } else {
        values.push(row[key]);
      };

    });
    data.push({
      values: values
    });
  });

  return {
    schema: dataSchema,
    rows: data
  };

};

/**
 * Converts CSV to JavaScript Object
 * @param {array} array CSV array
 * @returns {object} JS object
 */

connector.csvToObject = function(array) {
  var headers = array[0];
  var jsonData = [];
  for (var i = 1, length = array.length; i < length; i++) {
    var row = array[i];
    var data = {};
    for (var x = 0; x < row.length; x++) {
      data[headers[x]] = row[x];
    };
    jsonData.push(data);
  };
  return jsonData;
};

/**
 * Throws errors messages with the correct prefix to be shown to users.
 *
 * @param {string} message Error message to be shown in UI
 * @param {boolean} userSafe Indicates whether the error message can be shown to
 *      regular users (as opposed to debug error messages meant for admin users
 *      only.)
 */
connector.throwError = function(message, userSafe) {
  if (userSafe) {
    message = 'DS_USER:' + message;
  }
  throw new Error(message);
};

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
connector.isAdminUser = function() {
  return true;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
connector.logAndExecute = function(functionName, parameter) {
  if (connector.logEnabled && connector.isAdminUser()) {
    var paramString = JSON.stringify(parameter, null, 2);
    console.log([functionName, 'request', paramString]);
  }

  var returnObject = connector[functionName](parameter);

  if (connector.logEnabled && connector.isAdminUser()) {
    var returnString = JSON.stringify(returnObject, null, 2);
    console.log([functionName, 'response', returnString]);
  }

  return returnObject;
};
