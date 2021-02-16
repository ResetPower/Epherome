module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            builderOptions: {
                productName: 'Epherome',
                copyright: 'Copyright © 2021 ResetPower. All rights reserved.',
                appId: 'com.epherome',
                asar: true,
                compression: "maximum",
                directories: {
                    output: 'package'
                },
                /*win: {
                    icon: 'pubilc/icon.ico'
                },*/
            }
        }
    },
    devServer: {
        disableHostCheck: true
    },
    configureWebpack: {
        devtool: "source-map"
    },
    transpileDependencies: [
        'vuetify'
    ]
}
