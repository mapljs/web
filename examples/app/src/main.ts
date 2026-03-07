import { router } from '@mapl/web';
import compile from '@mapl/web/compiler/generic';
import { getDependency } from 'runtime-compiler';

const root = router.init();

router.get(root, '/');
router.post(root, '/json');
router.get(root, '/health');

console.log(getDependency(compile(root)).toString());
