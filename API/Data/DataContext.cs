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
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<MedicineDoctor> MedicineDoctors { get; set; }
        public DbSet<Country> Countries { get; set; }

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

            builder.Entity<Doctor>()
            .HasIndex(d => d.Name)
            .IsUnique();

            builder.Entity<Country>()
            .HasIndex(c => c.Name)
            .IsUnique();

            // Many-to-many: EF Core auto-generates the join table "DiseaseSymptom"
            builder.Entity<Disease>()
                .HasMany(d => d.Symptoms)
                .WithMany(s => s.Diseases)
                .UsingEntity(j => j.ToTable("DiseaseSymptom"));

            // Doctor <-> Country many-to-many
            builder.Entity<Doctor>()
                .HasMany(d => d.Countries)
                .WithMany(c => c.Doctors)
                .UsingEntity(j => j.ToTable("DoctorCountry"));

            // Medicine -> MedicineDoctor (one medicine has many per-doctor links)
            builder.Entity<MedicineDoctor>()
                .HasOne(md => md.Medicine)
                .WithMany(m => m.MedicineDoctors)
                .HasForeignKey(md => md.MedicineId)
                .OnDelete(DeleteBehavior.Cascade);

            // Doctor -> MedicineDoctor (one doctor has many per-medicine links)
            builder.Entity<MedicineDoctor>()
                .HasOne(md => md.Doctor)
                .WithMany(d => d.MedicineDoctors)
                .HasForeignKey(md => md.DoctorId)
                .OnDelete(DeleteBehavior.Cascade);

            // A given Medicine can only be linked to a given Doctor once
            builder.Entity<MedicineDoctor>()
                .HasIndex(md => new { md.MedicineId, md.DoctorId })
                .IsUnique();

            // MedicineDoctor <-> Symptom many-to-many (each doctor's own symptom list for that medicine)
            builder.Entity<MedicineDoctor>()
                .HasMany(md => md.Symptoms)
                .WithMany(s => s.MedicineDoctors)
                .UsingEntity(j => j.ToTable("MedicineDoctorSymptom"));

            // MedicineDoctor.Potencies: store List<string> as a single comma-separated column
            builder.Entity<MedicineDoctor>()
                .Property(md => md.Potencies)
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
