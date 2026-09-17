using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace API.Data
{
    public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, int, IdentityUserClaim<int>, AppUserRole, IdentityUserLogin<int>,
        IdentityRoleClaim<int>, IdentityUserToken<int>>(options)
    {
        public DbSet<Disease> Diseases { get; set; }
        public DbSet<Symptom> Symptoms { get; set; }
        public DbSet<Medicine> Medicines { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<AppUser>()
                .HasMany(ur => ur.UserRoles)
                .WithOne(u => u.User)
                .HasForeignKey(ur => ur.UserId)
                .IsRequired();

            builder.Entity<AppRole>()
                .HasMany(ur => ur.UserRoles)
                .WithOne(u => u.Role)
                .HasForeignKey(ur => ur.RoleId)
                .IsRequired();

            builder.Entity<Disease>()
            .HasIndex(d => d.Name)
            .IsUnique();

            builder.Entity<Symptom>()
           .HasIndex(s => s.Name)
           .IsUnique();

            builder.Entity<Medicine>()
           .HasIndex(m => m.Name)
           .IsUnique();

            // Many-to-many: EF Core auto-generates the join table "DiseaseSymptom"
            builder.Entity<Disease>()
                .HasMany(d => d.Symptoms)
                .WithMany(s => s.Diseases)
                .UsingEntity(j => j.ToTable("DiseaseSymptom"));

            // Symptom <-> Medicine many-to-many
            builder.Entity<Symptom>()
                .HasMany(s => s.Medicines)
                .WithMany(m => m.Symptoms)
                .UsingEntity(j => j.ToTable("SymptomMedicine"));

            // Medicine.Potencies: store List<string> as a single comma-separated column
            builder.Entity<Medicine>()
                .Property(m => m.Potencies)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Length == 0
                        ? new List<string>()
                        : v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList())
                .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                    (c1, c2) => c1!.SequenceEqual(c2!),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()));

        }
    }
}
