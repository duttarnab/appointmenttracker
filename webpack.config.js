const path = require('path');
//path
console.log(path.join(__dirname,'public'));

module.exports = {
   // entry: './src/index.jsx',
    entry: './client/index.js',
    output: {
        path: path.join(__dirname,'assets/js'),
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            loader: 'babel-loader',
            test: /\.js$/,
            exclude: /node_modules/
        },
        {
            test: /\.css$/,
            use: ['style-loader',
                'css-loader'
            ]
        }]
    },
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.join(__dirname,'assets/js')
    },
    externals: {
        'Config': JSON.stringify({
          serverUrl: "https://appointmenttracker.herokuapp.com",
          //application_id: "4a01b45a-59d5-4cf4-bc1e-d6cb93e5dd77"
          application_id: "dd990d14-a418-4ad0-939a-d30ca35f5f2c"
        })
      }
};