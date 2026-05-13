const redis = require('../config/redis');

const CacheService={

    async get(key){
        const raw=await redis.get(key);
        if(!raw) return null;
        try{
            return JSON.parse(raw);
        }catch(error){
            console.warn(`[Cache] Failed to parse value for key: ${key}`);
            return null;
        }
    },

    async set(key,value,ttlSeconds){
       await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    },

    async del(key){
        await redis.del(key);
    },
    

    async delPattern(pattern){
        
        let cursor='0';
        let totalDeleted=0;

        do{
         
        const[nextCursor,keys]=await redis.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            1000
        );

        cursor=nextCursor;
        if(keys.length>0){

            await redis.del(...keys);
            totalDeleted+=keys.length;
            console.log(`[Cache] Deleted ${keys.length} keys`);
        }
        }while(cursor!=='0');
    },

    async ttl(key) {
  return redis.ttl(key);
},

 async exists(key) {
  const result = await redis.exists(key);
  return result === 1;
},

async cacheAside(key,ttlSeconds,fetchFn){

    const cached=await this.get(key);

    if(cached!==null) return cached;

    const fresh=await fetchFn();

    if(fresh!==null && fresh!==undefined){
        await this.set(key,fresh,ttlSeconds);
    }
    return fresh;
},
};

module.exports=CacheService;