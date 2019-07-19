export namespace FileHelper {
const fs: any = require('fs');

 export async function toObject(nFile: string): Promise<any> {  
    if(!fs.existsSync(nFile))
    return ""   
    const data:any = JSON.parse(await toStream(nFile));
    return data;
  }

  export async function toString(nFile: string): Promise<string> {  
    if(!fs.existsSync(nFile))
    return ""    

    const data:any = toStream(nFile);
    return data;
  }

  function toStream(nFile: string): Promise<string> {
    const stream: any = fs.createReadStream(nFile, 'utf8');
    return new Promise((resolve, reject) => {
      let data: string = '';
      stream.on('data', (chunk: string) => (data += chunk.toString()));
      stream.on('error', reject);
      stream.on('end', () => {
        resolve(data);
      });
    });
  }
}