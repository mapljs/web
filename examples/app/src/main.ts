import { router } from '@mapl/web';

const root = router.init();

router.get(root, '/');
router.post(root, '/json');
router.get(root, '/health');

console.log(root);
