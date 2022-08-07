import fs from 'fs';
import path from 'path';

class ErrorLogsService {
  logErrors = (error: string): void => {
    const targetPath = 'E:\\Programming\\Node+TS\\src\\logs\\errorLogs.txt';

    const ourPath = 'E:\\Programming\\Node+TS\\src\\logs\\';

    const today = new Date().toISOString().slice(0, 10);

    if (fs.existsSync(ourPath)) {
      fs.appendFileSync(targetPath, `Date: ${today}\nError: ${error}\n\n`);
    } else {
      fs.mkdirSync(path.join(ourPath));
      fs.appendFileSync(targetPath, `Date: ${today}\nError: ${error}\n\n`);
    }
  };
}

export const errorLogsService = new ErrorLogsService();
