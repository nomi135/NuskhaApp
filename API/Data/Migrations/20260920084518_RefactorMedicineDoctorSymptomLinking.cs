using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RefactorMedicineDoctorSymptomLinking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SymptomMedicine");

            migrationBuilder.DropColumn(
                name: "Potencies",
                table: "Medicines");

            migrationBuilder.CreateTable(
                name: "MedicineDoctors",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MedicineId = table.Column<int>(type: "int", nullable: false),
                    DoctorId = table.Column<int>(type: "int", nullable: false),
                    Potencies = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicineDoctors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicineDoctors_Doctors_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicineDoctors_Medicines_MedicineId",
                        column: x => x.MedicineId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicineDoctorSymptom",
                columns: table => new
                {
                    MedicineDoctorsId = table.Column<int>(type: "int", nullable: false),
                    SymptomsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicineDoctorSymptom", x => new { x.MedicineDoctorsId, x.SymptomsId });
                    table.ForeignKey(
                        name: "FK_MedicineDoctorSymptom_MedicineDoctors_MedicineDoctorsId",
                        column: x => x.MedicineDoctorsId,
                        principalTable: "MedicineDoctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MedicineDoctorSymptom_Symptoms_SymptomsId",
                        column: x => x.SymptomsId,
                        principalTable: "Symptoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MedicineDoctors_DoctorId",
                table: "MedicineDoctors",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicineDoctors_MedicineId_DoctorId",
                table: "MedicineDoctors",
                columns: new[] { "MedicineId", "DoctorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MedicineDoctorSymptom_SymptomsId",
                table: "MedicineDoctorSymptom",
                column: "SymptomsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MedicineDoctorSymptom");

            migrationBuilder.DropTable(
                name: "MedicineDoctors");

            migrationBuilder.AddColumn<string>(
                name: "Potencies",
                table: "Medicines",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SymptomMedicine",
                columns: table => new
                {
                    MedicinesId = table.Column<int>(type: "int", nullable: false),
                    SymptomsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SymptomMedicine", x => new { x.MedicinesId, x.SymptomsId });
                    table.ForeignKey(
                        name: "FK_SymptomMedicine_Medicines_MedicinesId",
                        column: x => x.MedicinesId,
                        principalTable: "Medicines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SymptomMedicine_Symptoms_SymptomsId",
                        column: x => x.SymptomsId,
                        principalTable: "Symptoms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SymptomMedicine_SymptomsId",
                table: "SymptomMedicine",
                column: "SymptomsId");
        }
    }
}
