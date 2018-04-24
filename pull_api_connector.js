var API_KEY = "YOUR_API_KEY";


function getConfig(request) {
    var config = {
        configParams: [
            {
                "type": "INFO",
                "name": "welcomeMessage",
                "text": "For access please enter your Pull API Token"
            },
            {
                "type": "TEXTINPUT",
                "name": "apiKey",
                "displayName": "Pull API Token",
                "helpText": "API Token is required",
                "placeholder": "TOKEN"
            }
        ],
        dateRangeRequired: true
    };
    return config;
};


var pullAPISchema = [

    {
        name: "date",
        label: "Date",
        dataType: "STRING",
        group: "Date",
        isDefault: true,
        semantics: {
            conceptType: "DIMENSION",
            semanticGroup: "DATE_AND_TIME",
            semanticType: "YEAR_MONTH_DAY",
            isReaggregatable: false
        }
    },
    {
        name: 'app_name',
        label: 'App name',
        dataType: 'STRING',
        semantics: {
            conceptType: 'DIMENSION'
        }
    },
    {
        name: 'campaign_id',
        label: 'Campaign ID',
        dataType: 'STRING',
        semantics: {
            conceptType: 'DIMENSION'
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
            conceptType: 'DIMENSION'
        }
    },
    {
        name: 'country',
        label: 'Country',
        dataType: 'STRING',
        semantics: {
            conceptType: 'DIMENSION'
        }
    },
    {
        name: 'os',
        label: 'OS',
        dataType: 'STRING',
        semantics: {
            conceptType: 'DIMENSION',
            semanticType: "TEXT"
        }
    },
    {
        name: 'clicks',
        label: 'Clicks',
        dataType: 'NUMBER',
        semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true
        }
    },
    {
        name: 'conversions',
        label: 'Conversions',
        dataType: 'NUMBER',
        semantics: {
            conceptType: 'METRIC',
            isReaggregatable: true
        },
        defaultAggregationType: "SUM"
    },
    {
        name: 'payout',
        label: 'Revenue',
        dataType: 'NUMBER',
        semantics: {
            conceptType: 'METRIC',
            semanticGroup: "CURRENCY",
            semanticType: "CURRENCY_USD",
            isReaggregatable: true
        },
        defaultAggregationType: "SUM"
    },
    {
        name: 'ecpa',
        label: 'eCPA',
        dataType: 'NUMBER',
        semantics: {
            conceptType: 'METRIC',
            semanticGroup: "CURRENCY",
            semanticType: "CURRENCY_USD",
            isReaggregatable: false
        }
    }

];

function getSchema(request) {
    return {
        schema: pullAPISchema
    };
};


function csvToObject(array) {
    var headers = array[0];

    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++) {
        var row = array[i];
        var data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);

    }
    return jsonData;
}


function getData(request) {

    var dataSchema = [];
    request.fields.forEach(function (field) {
        for (var i = 0; i < pullAPISchema.length; i++) {
            if (pullAPISchema[i].name === field.name) {
                dataSchema.push(pullAPISchema[i]);
                break;
            }
        }
    });

    var url = [
        'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&fields=items(category%2Cfamily)&key=',
        API_KEY
    ];


    //var response = JSON.parse(UrlFetchApp.fetch(url.join(''))).items;

    //var response = Utilities.parseCsv(UrlFetchApp.fetch(url.join('')), ';')


    var csvFile = UrlFetchApp.fetch(url);

    var csvData = Utilities.parseCsv(csvFile, ';');


    var sourceData = csvToObject(csvData);

    var data = [];


    sourceData.forEach(function (row) {
        var values = [];
        dataSchema.forEach(function (field) {
            var key = field.name;
            values.push(row[key])
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

function getAuthType() {
    var response = {
        "type": "NONE"
    };
    return response;
}
