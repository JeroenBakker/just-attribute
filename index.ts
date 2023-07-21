import InteractionLogger from './src/InteractionLogger';

const instance = new InteractionLogger(localStorage);
instance.pageview();
