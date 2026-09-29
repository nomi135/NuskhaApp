using API.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace API.Services
{
    public class CacheService(IMemoryCache cache) : ICacheService
    {
        private const string VersionKey = "ReferenceDataCacheVersion";
        private static readonly TimeSpan DefaultExpiration = TimeSpan.FromHours(24);

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            var versionedKey = $"{key}_v{GetVersion()}";

            if (cache.TryGetValue(versionedKey, out T? cached) && cached is not null)
                return cached;

            var value = await factory();
            cache.Set(versionedKey, value, expiration ?? DefaultExpiration);
            return value;
        }

        public void InvalidateAll()
        {
            cache.Set(VersionKey, GetVersion() + 1, new MemoryCacheEntryOptions
            {
                Priority = CacheItemPriority.NeverRemove
            });
        }

        private int GetVersion() =>
            cache.GetOrCreate(VersionKey, entry =>
            {
                entry.Priority = CacheItemPriority.NeverRemove;
                return 0;
            });
    }
}