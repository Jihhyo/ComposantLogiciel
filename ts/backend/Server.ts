import Koa from 'koa';
import Router from '@koa/router';
import { fetchAndParseData } from './dataProcessor';

const app = new Koa();
const router = new Router();

router.get('/randomize', async (ctx) => {
    try {
        const data = await fetchAndParseData();
        const randomData = data[Math.floor(Math.random() * data.length)];
        ctx.status = 200;
        ctx.body = { randomData };
    } catch (error) {
        console.error('Erreur dans /randomize:', error);
        ctx.status = 500;
        ctx.body = { error: 'Erreur interne du serveur.' };
    }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
    console.info(`Serveur démarré sur http://localhost:${PORT}`);
});
