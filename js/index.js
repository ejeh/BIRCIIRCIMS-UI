// const BACKEND_URL = "http://localhost:5000/api";
const BACKEND_URL = "https://bscr-mis.onrender.com/api";

let userData = localStorage.getItem("token");
userData = JSON.parse(userData);
const { token, user } = userData;

const apiusers = `${BACKEND_URL}/users/get-system-users`;
// $.ajax({
//   type: "GET",
//   url: apiusers,
//   headers: {
//     Authorization: `Bearer ${token}`,
//   },
//   success: function (data) {
//     let tableBody = "";
//     data.forEach((item) => {
//       tableBody += `<tr>
//       <td>${item.firstname} ${item.lastname}</td>
//        <td>${item.phone}</td>
//        <td>${item.email}</td>
//        <td>${item.role}</td>
//        <td>
//        <a
//        href="../app/user-management.html"
//        class="btn btn-sm"
//         style="background-color: #4C956C; color: #fff"
//        >update
//        </a>
//        </td>
//                       </tr>`;
//     });
//     $("#dataTable tbody").html(tableBody);
//   },
//   error: function (error) {
//     console.error("Error fetching data", error);
//   },
// });

// Assign Role
$(document).ready(function () {
  $("#assignRoleForm").submit(function (e) {
    e.preventDefault();

    const userId = $("#userId").val();
    const role = $("#newRole").val();

    $.ajax({
      url: `${BACKEND_URL}/users/${userId}`, // Backend API endpoint
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({ role }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        if (data) {
          Swal.fire("Bravo", "Account successfully updated", "success");
        } else {
          Swal.fire("Oops...", data.message, "error");
        }
      },
      error: function (err) {
        console.error("Error saving data:", error);
        Swal.fire("Oops...", data.responseJSON.message, "error");
      },
    });
  });
});

$(document).ready(function () {
  // Fetch user details on page load
  $.ajax({
    url: `${BACKEND_URL}/users/${user.id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      const {
        firstname,
        lastname,
        middlename,
        phone,
        stateOfOrigin,
        LGA,
        gender,
        DOB,
        nationality,
        address,
        nextOfKin,
        occupation,
        education,
        maritalStatus,
      } = data;

      document.getElementById("first_name").value = firstname;
      document.getElementById("last_name").value = lastname;
      document.getElementById("middlename").value = middlename;
      document.getElementById("phone").value = phone;
      document.getElementById("state").value = stateOfOrigin;
      document.getElementById("lga").value = LGA;
      document.getElementById("gender").value = gender;
      document.getElementById("dob").value = DOB;
      document.getElementById("nationality").value = nationality;
      document.getElementById("address").value = address;
      document.getElementById("maritalStatus").value = maritalStatus;

      nextOfKin.map((data) => {
        const { fatherName, motherName, nextOfKinDetails } = data;
        document.getElementById("fatherName").value = `${fatherName}`;
        document.getElementById("motherName").value = `${motherName}`;

        nextOfKinDetails.map((d) => {
          const { contactNumber, name, relationship } = d;

          document.getElementById("number").value = `${contactNumber}`;
          document.getElementById("name").value = `${name}`;
          document.getElementById("relationship").value = `${relationship}`;
        });
      });

      occupation.map((data) => {
        const {
          current_occupation,
          employer_name,
          employer_address,
          employment_status,
        } = data;
        document.getElementById(
          "current_occupation"
        ).value = `${current_occupation}`;
        document.getElementById("employer_name").value = `${employer_name}`;
        document.getElementById(
          "employer_address"
        ).value = `${employer_address}`;
        document.getElementById(
          "employment_status"
        ).value = `${employment_status}`;
      });

      education.map((data) => {
        const { highestEducationLevel, institutionAttended, graduationYear } =
          data;
        document.getElementById(
          "highestEducationLevel"
        ).value = `${highestEducationLevel}`;
        document.getElementById(
          "institutionAttended"
        ).value = `${institutionAttended}`;
        document.getElementById("graduationYear").value = `${graduationYear}`;
      });
    },
    error: function (error) {
      Swal.fire("Oops...", data.responseJSON.message, "error");
      console.error("Error fetching profile:", error);
      $("#name").text("Error loading profile");
    },
  });
});

$(document).ready(function () {
  $("#profilefrm").on("submit", function (e) {
    e.preventDefault();

    const middlename = $("#middlename").val();
    const phone = $("#phone").val();
    const lastname = $("#lastname").val();
    const gender = $("#gender").val();
    const state = $("#state").val();
    const dob = $("#dob").val();
    const lga = $("#lga").val();
    const nationality = $("#nationality").val();
    const address = $("#address").val();
    const maritalStatus = $("#maritalStatus").val();

    if (
      middlename != "" &&
      phone != "" &&
      lastname != "" &&
      gender != "" &&
      state != "" &&
      dob != "" &&
      lga != "" &&
      nationality != "" &&
      address != "" &&
      maritalStatus != ""
    ) {
      if (phone.length < 11) {
        Swal.fire("Oops...", "Phone must be at least 11 characters", "error");
      } else {
        $.ajax({
          type: "PUT",
          url: `${BACKEND_URL}/users/${user.id}`,
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify({
            gender: gender,
            middlename: middlename,
            lastname: lastname,
            phone: phone,
            DOB: dob,
            LGA: lga,
            stateOfOrigin: state,
            address: address,
            nationality: nationality,
            maritalStatus: maritalStatus,
          }),
          beforeSend: function () {
            $("#submitbtn").html("<i class='fa fa-spinner'></i>");
          },
          success: function (data) {
            // Do something on success
            if (data) {
              Swal.fire("Bravo", "Account successfully updated", "success");
            } else {
              Swal.fire("Oops...", data.message, "error");
            }
          },
          error: function (data) {
            Swal.fire("Oops...", data.responseJSON.message, "error");
          },
        });
      }
    } else {
      Swal.fire("Oops...", "invalid", "error");
    }
  });
});

// Next Of Kin
// Submit form data
$(document).ready(function () {
  $("#nextOfKinForm").submit(function (e) {
    e.preventDefault();

    const data = {
      fatherName: $("#fatherName").val(),
      motherName: $("#motherName").val(),
      nextOfKinDetails: [
        {
          name: $("#name").val(),
          relationship: $("#relationship").val(),
          contactNumber: $("#number").val(),
        },
      ],
    };

    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        nextOfKin: data,
      }),

      success: function (data) {
        if (data) {
          Swal.fire("Bravo", "Account successfully updated", "success");
        } else {
          Swal.fire("Oops...", data.message, "error");
        }
      },
      error: function (data) {
        Swal.fire("Oops...", data.responseJSON.message, "error");
      },
    });
  });
});

// Education
// Submit form data
$(document).ready(function () {
  $("#educationForm").submit(function (e) {
    e.preventDefault();

    const data = {
      highestEducationLevel: $("#highestEducationLevel").val(),
      institutionAttended: $("#institutionAttended").val(),
      graduationYear: $("#graduationYear").val(),
    };

    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        education: data,
      }),

      success: function (data) {
        if (data) {
          Swal.fire("Bravo", "Account successfully updated", "success");
        } else {
          Swal.fire("Oops...", data.message, "error");
        }
      },
      error: function (data) {
        Swal.fire("Oops...", data.responseJSON.message, "error");
      },
    });
  });
});

// Employmnt
// Submit form data
$(document).ready(function () {
  $("#employmentForm").submit(function (e) {
    e.preventDefault();

    const data = {
      current_occupation: $("#current_occupation").val(),
      employer_name: $("#employer_name").val(),
      employer_address: $("#employer_address").val(),
      employment_status: $("#employment_status").val(),
      // },
    };

    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        occupation: data,
      }),

      success: function (response) {
        if (data) {
          Swal.fire("Bravo", "Account successfully updated", "success");
        } else {
          Swal.fire("Oops...", data.message, "error");
        }
      },
      error: function (error) {
        console.error("Error saving data:", error);
      },
    });
  });
});

// Education
// Submit form data
$(document).ready(function () {
  $("#healthInfoForm").submit(function (e) {
    e.preventDefault();

    const data = {
      bloodGroup: $("#bloodGroup").val(),
      genotype: $("#genotype").val(),
      disabilityStatus: $("#disabilityStatus").val(),
    };

    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        healthInfo: data,
      }),

      success: function (data) {
        if (data) {
          Swal.fire("Bravo", "Account successfully updated", "success");
        } else {
          Swal.fire("Oops...", data.message, "error");
        }
      },
      error: function (data) {
        Swal.fire("Oops...", data.responseJSON.message, "error");
      },
    });
  });
});

function searchTable() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");
  console.log(table);
  console.log(rows);

  for (let i = 1; i < rows.length; i++) {
    // Skip header row
    const rowText = rows[i].textContent.toLowerCase();
    console.log(rowText);
    console.log(rowText.includes(input));
    console.log(rows[i].classList);

    if (rowText.includes(input)) {
      rows[i].classList.remove("no-match");
    } else {
      rows[i].classList.add("no-match");
    }
  }
}

$(document).ready(function () {
  let currentPage = 1;
  const pageSize = 10;

  function fetchData(page) {
    $.ajax({
      url: `${BACKEND_URL}/users?page=${page}&limit=${pageSize}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        console.log(response);

        const { data, hasNextPage } = response;

        const tableBody = $("#table-body");
        tableBody.empty();

        data.forEach((item, index) => {
          tableBody.append(`
            <tr>
              <td>${(page - 1) * pageSize + index + 1}</td>
              <td>${item.firstname} ${item.lastname}</td>
              <td>${item.phone}</td>
              <td>${item.email}</td>
              <td>${item.role}</td>
              <td>
              <a
              href="../app/user-management.html"
              class="btn btn-sm"
                style="background-color: #4C956C; color: #fff"
              >update
              </a>
              </td>
            </tr>
          `);
        });

        // Update button states
        $("#prev-btn").prop("disabled", page === 1);
        $("#next-btn").prop("disabled", !hasNextPage);
      },
      error: function (error) {
        console.error("Error fetching data:", error);
      },
    });
  }

  $("#prev-btn").click(function () {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage);
    }
  });

  $("#next-btn").click(function () {
    currentPage++;
    fetchData(currentPage);
  });

  // Initial data load
  fetchData(currentPage);
});
