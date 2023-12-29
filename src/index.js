const fs = require('fs');
const path = require('path');

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
    constructor(env, argv) {
        this.env = env;
        this.isWatching = false;
        this.isWatch = argv.watch === true;
    }

    apply(compiler) {
        if (this.isWatch) {

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
}


class SymlinkCreator {
    constructor(options) {
        // Store options if necessary, or just hard-code paths
    }

    apply(compiler) {
        // Use compiler.hooks to tap into the Webpack build process
        compiler.hooks.afterEmit.tap('SymlinkPlugin', (compilation) => {
            // Perform symlink operations here
            symlink('./dist', '../dist', 'dir');
            symlink('./node_modules/@cocreate/pwa/src/service-worker.js', '../service-worker.js', 'file');
            symlink('./node_modules/@cocreate/pwa/src/manifest.webmanifest', '../manifest.webmanifest', 'file');
            symlink('./node_modules/@cocreate/pwa/src/offline.html', '../offline.html', 'file');
        });

        function symlink(target, destination, option) {
            if (fs.existsSync(target)) {
                target = path.resolve(target)

                if (!fs.existsSync(destination)) {
                    destination = path.resolve(destination)

                    fs.symlink(target, destination, option, (err) => {
                        if (err)
                            console.log(err);
                        else
                            console.log("symlink added: ", target);
                    })

                }
            }
        }
    }
}

module.exports = { ModuleGenerator, fileUploader, SymlinkCreator };
