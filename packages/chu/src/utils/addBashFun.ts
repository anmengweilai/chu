import { fsExtra } from '@chu/utils';
import { getRcPath } from './rcFile';

export const addBashFun = () => {
  const bashProfilePath = getRcPath('.bash_profile');
  console.log(bashProfilePath);
  const text = fsExtra.readFileSync(bashProfilePath, 'utf-8');
  console.log({ text });
  const context = `${text}  \n
  cd_to_designated_folder() { \n
    cd $1
    echo "currentPath:" $1 \n
  }
  `;
  console.log(context);
  // fsExtra.writeFileSync(bashProfilePath, context, { encoding: 'utf-8' });
};
