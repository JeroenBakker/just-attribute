import InteractionLogger from './src/InteractionLogger';

const instance = new InteractionLogger(localStorage);

globalThis.__jaLogger = instance;

instance.onAttributionChange((interaction) => {
    console.group('just-attribute');
    console.log('Attribution changed:', interaction);
    console.groupEnd();
});

instance.pageview();
