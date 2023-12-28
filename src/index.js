const fs = require('fs');
const upload = require('@cocreate/cli/src/commands/upload.js')

class ModuleGenerator {
    constructor(modulesConfig) {
        this.modulesConfig = modulesConfig;
    }

    apply(compiler) {
        let CoCreateConfig;
        if (typeof this.modulesConfig === 'object')
            CoCreateConfig = this.modulesConfig.config;
        else {
            try {
                CoCreateConfig = require(this.modulesConfig.configPath);
            } catch (error) {
                console.error('Error loading CoCreate.config.js:', error);
                throw error;  // Stop compilation process if configuration is critical
            }
        }
        let modulesGenerated = false

        compiler.hooks.beforeCompile.tapAsync('CoCreateLazyloader', (params, callback) => {
            if (modulesGenerated)
                callback();
            else {
                let outputPath = this.modulesConfig.outputPath || './modules.js'; // Default path for generated module.js

                // Generate module content based on CoCreateConfig
                let moduleContent = `import { dependency, lazyLoad } from '@cocreate/lazy-loader';\n\n`;
                Object.entries(this.modulesConfig).forEach(([moduleName, moduleInfo]) => {
                    if (moduleName === 'outputPath' || typeof moduleInfo !== 'object') return;
                    if (moduleInfo.selector) {
                        // Generate lazyLoad statements for modules with selectors
                        moduleContent += `lazyLoad('${moduleName}', '${moduleInfo.selector}', () => import(/*webpackChunkName: "${moduleName}-chunk"*/ '${moduleInfo.import}'));\n`;
                    } else {
                        // Generate dependency statements for other modules
                        moduleContent += `dependency('${moduleName}', import(/*webpackChunkName: "${moduleName}-chunk"*/ '${moduleInfo.import}'));\n`;
                    }
                });

                // Write the module content to the specified outputPath
                fs.writeFile(outputPath, moduleContent, (err) => {
                    if (err) {
                        console.error(`Error writing ${outputPath}:`, err);
                        callback(err); // Handle errors in async hook
                    } else {
                        modulesGenerated = true
                        console.log(`${outputPath} generated successfully.`);
                        callback(); // Proceed with compilation
                    }
                });
            }
        });
    }
}
class fileUploader {
    constructor(env) {
        this.env = env;
        this.isWatching = false;
    }

    apply(compiler) {
        if (this.env.beforeCompilation) {
            // Directly perform upload here
            upload(process.cwd(), ['../', '-w']);
        }

        if (this.env.afterCompilation) {
            compiler.hooks.emit.tapAsync('watchFiles', (compilation, callback) => {
                if (!this.isWatching) {
                    this.isWatching = true;
                    upload(process.cwd(), ['../', '-w']);
                }
                callback();
            });
        }
    }
}


module.exports = { ModuleGenerator, fileUploader };
