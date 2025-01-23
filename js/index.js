const BACKEND_URL = "http://localhost:5000/api";
// const BACKEND_URL = "https://bscr-mis.onrender.com/api";

let userData = localStorage.getItem("token");
userData = JSON.parse(userData);
const { token, user } = userData;

$(document).ready(function () {
  // Assume the user role is dynamically fetched from your backend
  const userRole = user.role;

  // Hide all menus initially
  $(".super-admin-menu, .support-admin-menu, .user-menu").hide();

  // Show menus based on role
  if (userRole === "super_admin") {
    $(".super-admin-menu").show();
  } else if (userRole === "support_admin") {
    $(".support-admin-menu").show();
    // Grant access to some super-admin menus
    $('.super-admin-menu:has(a[href="approvals.html"])').show();
  } else if (userRole === "user") {
    $(".user-menu").show();
  }
});

$(document).ready(function () {
  // Utility function to set input values
  const setInputValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) {
      element.value = value || "";
    }
  };

  // Populate fields for nested data
  const populateNestedFields = (dataArray, mapping) => {
    dataArray.forEach((data) => {
      Object.entries(mapping).forEach(([key, id]) => {
        setInputValue(id, data[key]);
      });
    });
  };

  //   // Populate fields for nested data
  const populateNestedField = (dataArray, mapping, prefix = "") => {
    dataArray.forEach((data, index) => {
      const indexPrefix = `${prefix}${index + 1}`;
      Object.entries(mapping).forEach(([key, idSuffix]) => {
        setInputValue(`${indexPrefix}_${idSuffix}`, data[key]);
      });
    });
  };

  // Fetch user details on page load
  $.ajax({
    url: `${BACKEND_URL}/users/${user.id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      // Destructure the main fields
      const {
        firstname,
        lastname,
        email,
        middlename,
        phone,
        stateOfOrigin,
        LGA,
        gender,
        DOB,
        nationality,
        address,
        nextOfKin = [],
        occupation = [],
        education = [],
        family = [],
        neighbor = [],
        business = [],
        maritalStatus,
      } = data;

      // Populate main fields
      const mainFields = {
        first_name: firstname,
        last_name: lastname,
        email: email,
        middlename: middlename,
        phone: phone,
        stateOfOrigin: stateOfOrigin,
        lga: LGA,
        gender: gender,
        dob: DOB,
        maritalStatus: maritalStatus,
        address: address,
        nationality: nationality,
      };
      Object.entries(mainFields).forEach(([id, value]) =>
        setInputValue(id, value)
      );

      // Populate next of kin details
      populateNestedFields(nextOfKin, {
        nok_surname: "nok_surname",
        nok_firstname: "nok_firstname",
        nok_middlename: "nok_middlename",
        nok_relationship: "nok_relationship",
        countryOfResidence: "countryOfResidence",
        stateOfResidence: "stateOfResidence",
        lgaOfResidence: "lgaOfResidence",
        cityOfResidence: "cityOfResidence",
        nok_address: "nok_address",
      });

      // Populate occupation details
      populateNestedFields(occupation, {
        current_occupation: "current_occupation",
        employer_name: "employer_name",
        employer_address: "employer_address",
        employment_status: "employment_status",
      });

      // Populate education details
      populateNestedFields(education, {
        highestEducationLevel: "highestEducationLevel",
        institutionAttended: "institutionAttended",
        graduationYear: "graduationYear",
      });

      // Populate neighbors' details
      populateNestedField(
        neighbor,
        {
          name: "name",
          address: "address",
          phone: "phone",
        },
        "neighbor_"
      );

      // Populate neighbors' details
      populateNestedField(
        family,
        {
          name: "name",
          relationship: "relationship",
          phone: "phone",
          address: "address",
        },
        "family_"
      );

      populateNestedFields(business, {
        biz_name: "biz_name",
        biz_type: "biz_type",
        registration_number: "registration_number",
        biz_address: "biz_address",
        nature_of_bussiness: "nature_of_bussiness",
        numberOfYears: "numberOfYears",
        numberOfEmployees: "numberOfEmployees",
        cityOfResidence: "cityOfResidence",
        TIN: "TIN",
        biz_phone: "biz_phone",
        biz_email: "biz_email",
      });
    },
    error: function (error) {
      const errorMessage =
        error.responseJSON?.message || "Failed to load user profile.";
      Swal.fire("Oops...", errorMessage, "error");
      console.error("Error fetching profile:", error);
      $("#name").text("Error loading profile");
    },
  });
});

//Update profile details
$(document).ready(function () {
  let autoSaveTimer;

  // Function to collect form data
  const collectFormData = () => {
    return {
      middlename: $("#middlename").val(),
      lastname: $("#last_name").val(),
      // phone: $("#phone").val(),
      gender: $("#gender").val(),
      stateOfOrigin: $("#state").val(),
      DOB: $("#dob").val(),
      LGA: $("#lga").val(),
      nationality: $("#nationality").val(),
      address: $("#address").val(),
      maritalStatus: $("#maritalStatus").val(),
      // email: $("#email").val(),
      nextOfKin: {
        nok_surname: $("#nok_surname").val().trim(),
        nok_firstname: $("#nok_firstname").val().trim(),
        nok_middlename: $("#nok_middlename").val().trim(),
        nok_relationship: $("#nok_relationship").val().trim(),
        countryOfResidence: $("#countryOfResidence").val().trim(),
        stateOfResidence: $("#stateOfResidence").val().trim(),
        lgaOfResidence: $("#lgaOfResidence").val().trim(),
        cityOfResidence: $("#cityOfResidence").val().trim(),
        nok_address: $("#nok_address").val().trim(),

        // contactNumber: $("#contactNumber").val().trim(),
      },
      education: {
        highestEducationLevel: $("#highestEducationLevel").val(),
        institutionAttended: $("#institutionAttended").val(),
        graduationYear: $("#graduationYear").val(),
      },
      occupation: {
        current_occupation: $("#current_occupation").val(),
        employer_name: $("#employer_name").val(),
        employer_address: $("#employer_address").val(),
        employment_status: $("#employment_status").val(),
      },
      healthInfo: {
        bloodGroup: $("#bloodGroup").val(),
        genotype: $("#genotype").val(),
        disabilityStatus: $("#disabilityStatus").val(),
      },

      business: {
        biz_name: $("#biz_name").val().trim(),
        biz_type: $("#biz_type").val(),
        registration_number: $("#registration_number").val().trim(),
        biz_address: $("#biz_address").val().trim(),
        nature_of_bussiness: $("#nature_of_bussiness").val().trim(),
        numberOfYears: $("#numberOfYears").val().trim(),
        numberOfEmployees: $("#numberOfEmployees").val().trim(),
        annualRevenue: $("#annualRevenue").val().trim(),
        nok_address: $("#nok_address").val().trim(),
        TIN: $("#TIN").val().trim(),
        biz_phone: $("#biz_phone").val().trim(),
        biz_email: $("#biz_email").val().trim(),

        // contactNumber: $("#contactNumber").val().trim(),
      },
      neighbor: [
        {
          name: $("#neighbor_1_name").val(),
          address: $("#neighbor_1_address").val(),
          phone: $("neighbor_1_phone").val(),
        },
        {
          name: $("#neighbor_2_name").val(),
          address: $("#neighbor_2_address").val(),
          phone: $("#neighbor_2_phone").val(),
        },
        {
          name: $("#neighbor_3_name").val(),
          address: $("#neighbor_3_address").val(),
          phone: $("#neighbor_3_phone").val(),
        },
        {
          name: $("#neighbor_4_name").val(),
          address: $("#neighbor_4_address").val(),
          phone: $("#neighbor_4_phone").val(),
        },
        {
          name: $("#neighbor_5_name").val(),
          address: $("#neighbor_5_address").val(),
          phone: $("#neighbor_5_phone").val(),
        },
      ],

      family: [
        {
          name: $("#family_1_name").val(),
          relationship: $("#family_1_relationship").val(),
          address: $("#family_1_address").val(),
          phone: $("#family_1_phone").val(),
        },
        {
          name: $("#family_2_name").val(),
          relationship: $("#family_2_relationship").val(),
          address: $("#family_2_address").val(),
          phone: $("#family_2_phone").val(),
        },
        {
          name: $("#family_3_name").val(),
          relationship: $("#family_3_relationship").val(),
          address: $("#family_3_address").val(),
          phone: $("#family_3_phone").val(),
        },
        {
          name: $("#family_4_name").val(),
          relationship: $("#family_4_relationship").val(),
          address: $("#family_4_address").val(),
          phone: $("#family_4_phone").val(),
        },
        {
          name: $("#family_5_name").val(),
          relationship: $("#family_5_relationship").val(),
          address: $("#family_5_address").val(),
          phone: $("#family_5_phone").val(),
        },
      ],
    };
  };

  // Auto-save function
  const autoSave = () => {
    const formData = collectFormData();
    // Send the form data to the server using AJAX or fetch API
    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(formData),
      success: function () {
        console.log("Auto-save successful");
        $("#autoSaveStatus").text("Saved").css("color", "green");
      },
      error: function () {
        console.error("Auto-save failed");
        $("#autoSaveStatus").text("Failed to save").css("color", "red");
      },
    });
  };

  // Debounced auto-save on input change
  $("input, select, textarea").on("input change", function () {
    clearTimeout(autoSaveTimer);
    $("#autoSaveStatus").text("Saving...").css("color", "blue");

    autoSaveTimer = setTimeout(() => {
      autoSave();
    }, 1000); // 1-second debounce
  });

  // Unified form submission
  $("#unifiedForm").on("submit", function (e) {
    e.preventDefault();

    const formData = collectFormData();

    $.ajax({
      type: "PUT",
      url: `${BACKEND_URL}/users/${user.id}`,
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify(formData),
      success: function (response) {
        Swal.fire("Congratulations", "Account successfully updated", "success");
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || "An error occurred";
        Swal.fire("Oops...", errorMessage, "error");
      },
    });
  });
});

function searchTable() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const table = document.getElementById("dataTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    // Skip header row
    const rowText = rows[i].textContent.toLowerCase();

    if (rowText.includes(input)) {
      rows[i].classList.remove("no-match");
    } else {
      rows[i].classList.add("no-match");
    }
  }
}

// //Get All Users
$(document).ready(function () {
  // Track the current page and define the page size
  const currentPage = { value: 1 };
  const pageSize = 10;

  // Utility function to make API requests
  const apiRequest = (
    url,
    method,
    headers = {},
    data = null,
    onSuccess,
    onError
  ) => {
    $.ajax({
      url,
      method,
      headers,
      data,
      success: onSuccess,
      error: onError || ((error) => console.error("API Error:", error)),
    });
  };

  // Update the table with user data
  const updateTable = (data, page) => {
    const tableBody = $("#table-body");
    tableBody.empty(); // Clear existing table rows

    // Populate table rows with user data
    data.forEach((item, index) => {
      const rowHtml = `
        <tr>
          <td>${(page - 1) * pageSize + index + 1}</td>
          <td>${item.firstname} ${item.lastname}</td>
          <td>${item.phone}</td>
          <td>${item.email}</td>
          <td>${item.role}</td>
          <td>
            <button class="btn btn-sm update-role-btn" 
                    data-id="${item._id}" 
                    data-role="${item.role}" 
                    style="background-color: #4C956C; color: #fff">
              Update Role
            </button>
          </td>
           <td>
           <button class="btn btn-sm view-details-btn" 
                    data-id="${item._id}" 
                    style="background-color: #007BFF; color: #fff">
              View
            </button>
          </td>
        </tr>`;
      tableBody.append(rowHtml); // Add the row to the table
    });
  };

  // Fetch user data for the current page
  const fetchData = (page) => {
    const url = `${BACKEND_URL}/users?page=${page}&limit=${pageSize}`;
    const headers = { Authorization: `Bearer ${token}` };

    apiRequest(url, "GET", headers, null, (response) => {
      const { data, hasNextPage } = response;
      updateTable(data, page);

      $("#prev-btn").prop("disabled", page === 1);
      $("#next-btn").prop("disabled", !hasNextPage);
      $("#usercount").text(data.length);
    });
  };

  // Update the role of a specific user
  const updateRole = (userId, currentRole) => {
    const roleMap = {
      user: "support_admin",
      support_admin: "super_admin",
      super_admin: "user",
    };
    const newRole = roleMap[currentRole];

    if (!newRole) return;

    const url = `${BACKEND_URL}/users/${userId}/role`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = JSON.stringify({ role: newRole });

    apiRequest(
      url,
      "PATCH",
      headers,
      data,
      () => {
        alert("Role updated successfully!");
        fetchData(currentPage.value);
      },
      () => alert("Failed to update role.")
    );
  };

  // Fetch user details and display them
  const viewDetails = (userId) => {
    const url = `${BACKEND_URL}/users/${userId}`;
    const headers = { Authorization: `Bearer ${token}` };

    apiRequest(
      url,
      "GET",
      headers,
      null,
      (response) => {
        const details = `
          <p><strong>Name:</strong> ${response.firstname} ${response.lastname}</p>
          <p><strong>Email:</strong> ${response.email}</p>
          <p><strong>Phone:</strong> ${response.phone}</p>
          <p><strong>Role:</strong> ${response.role}</p>
        `;
        $("#details-modal .modal-body").html(details); // Populate modal with user details
        $("#details-modal").modal("show"); // Show the modal
      },
      () => alert("Failed to fetch user details.")
    );
  };

  // Handle role update button clicks
  $("#table-body").on("click", ".update-role-btn", function () {
    const userId = $(this).data("id");
    const currentRole = $(this).data("role");
    updateRole(userId, currentRole);
  });

  // Handle view details button clicks
  $("#table-body").on("click", ".view-details-btn", function () {
    const userId = $(this).data("id");
    viewDetails(userId);
  });

  // Handle pagination
  $("#prev-btn").click(function () {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchData(currentPage.value);
    }
  });

  $("#next-btn").click(function () {
    currentPage.value++;
    fetchData(currentPage.value);
  });

  // Load initial data
  fetchData(currentPage.value);
});

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop fade show";
    backdrop.id = `${modalId}-backdrop`;
    document.body.appendChild(backdrop);
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    const backdrop = document.getElementById(`${modalId}-backdrop`);
    if (backdrop) {
      backdrop.remove();
    }
  }
}

// // Indigene Certificate
$(document).ready(function () {
  const pageSize = 10;
  let currentPage = 1;
  let rejectionId = null;

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const tableBody = $("#view-all-request-table");

  function updatePaginationButtons(hasNextPage) {
    $("#btn-prev").prop("disabled", currentPage === 1);
    $("#btn-next").prop("disabled", !hasNextPage);
  }

  function updateRequestCount(count) {
    $("#request").text(count);
  }

  function renderTable(data) {
    tableBody.empty();
    data.forEach((item, index) => {
      const isRejected = item.status === "Rejected";
      tableBody.append(`
        <tr data-id="${item._id}">
          <td>${(currentPage - 1) * pageSize + index + 1}</td>
          <td>${item.firstname} ${item.lastname}</td>
          <td>${item.phone}</td>
          <td>${item.email}</td>
          <td>${item.status}</td>
          <td>
            <button class="btn btn-xs btn-approve" data-id="${
              item._id
            }" style="background-color: #4C956C; color: #fff">Approve</button>
          </td>
           <td>
            <button class="btn btn-xs btn-danger btn-reject" data-id="${
              item._id
            }" ${isRejected ? "disabled" : ""}>Reject</button>
          </td>
          <td>
            <button class="btn btn-xs btn-info btn-view" data-id="${
              item._id
            }" style="background-color: #017BFF; color: #fff">View</button>
          </td>
        </tr>
      `);
    });
  }

  function fetchData(page) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/request?page=${page}&limit=${pageSize}&statuses=Pending,Rejected`,
      method: "GET",
      headers: apiHeaders,
      success: function (response) {
        const { data, hasNextPage } = response;
        renderTable(data);
        updatePaginationButtons(hasNextPage);
        updateRequestCount(data.length);
      },
      error: function (error) {
        console.error("Error fetching data:", error);
      },
    });
  }

  function handleApproval(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${requestId}/approve`,
      method: "PATCH",
      headers: apiHeaders,
      success: function () {
        fetchData(currentPage);
      },
      error: function (error) {
        console.error("Error approving request:", error);
      },
    });
  }

  function handleRejection(rejectionReason) {
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${rejectionId}/reject`,
      method: "PATCH",
      contentType: "application/json",
      data: JSON.stringify({ rejectionReason }),
      headers: apiHeaders,
      success: function () {
        $("#rejectionModal").modal("hide");
        $("#rejectionReason").val("");
        fetchData(currentPage);
      },
      error: function (error) {
        console.error("Error rejecting request:", error);
      },
    });
  }

  function handleView(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${requestId}/request`,
      method: "GET",
      headers: apiHeaders,
      success: function (response) {
        // Populate the view modal with the request details
        $("#viewModal .modal-body").html(`
          <p><strong>Name:</strong> ${response.firstname} ${
          response.lastname
        }</p>
          <p><strong>Phone:</strong> ${response.phone}</p>
          <p><strong>Email:</strong> ${response.email}</p>
          <p><strong>Status:</strong> ${response.status}</p>
          <p><strong>Details:</strong> ${response.details || "N/A"}</p>
        `);
        $("#viewModal").modal("show");
      },
      error: function (error) {
        console.error("Error fetching request details:", error);
      },
    });
  }

  $(document).on("click", ".btn-approve", function () {
    const requestId = $(this).data("id");
    handleApproval(requestId);
  });

  $(document).on("click", ".btn-reject", function () {
    rejectionId = $(this).data("id");
    $("#rejectionModal").modal("show");
  });

  $("#dataTable").on("click", ".btn-view", function () {
    const requestId = $(this).data("id");

    handleView(requestId);
  });

  $("#submitRejection").click(function () {
    const reason = $("#rejectionReason").val();
    handleRejection(reason);
  });

  $("#btn-prev").click(function () {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage);
    }
  });

  $("#btn-next").click(function () {
    currentPage++;
    fetchData(currentPage);
  });

  // Initial data load
  fetchData(currentPage);
});

// find certificate by ID
$(document).ready(function () {
  let resubmitId = null;
  let downloadUrl = `${BACKEND_URL}/indigene/certificate/download/`;

  function fetchData() {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${user.id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (data) {
        const tableBody = $("#request-table");
        tableBody.empty();

        // Helper function to append a row to the table
        const appendRow = (isDisabled) => {
          tableBody.append(`
          <tr>
            <td>${data.firstname} ${data.lastname}</td>
            <td>${data.phone}</td>
            <td>${data.email}</td>
            <td>${data.status}</td>
             <td>${data.resubmissionAttempts || 0}</td>
            <td>
              <button class="btn btn-xs btn-download" data-id="${data._id}" 
              ${isDisabled ? "disabled" : ""} 
        >
                Download Certificate
              </button>
            </td>
             <td>
              ${
                data.status === "Rejected" && data.resubmissionAllowed
                  ? `<button class="btn btn-primary btn-sm resubmit-btn" data-id="${data._id}" data-name="${data.firstname}">Resubmit</button>`
                  : ""
              }
            </td>
          </tr>
        `);
        };

        if (data.status === "Rejected" || data.status === "Pending") {
          appendRow(true);
        } else if (data.status === "Approved") {
          appendRow(false);
        }

        // Function to handle certificate download
        // const handleDownload = (certificateId) => {
        //   $.ajax({
        //     url: `${downloadUrl}${certificateId}`,
        //     method: "GET",
        //     headers: {
        //       Authorization: `Bearer ${token}`,
        //     },
        //     xhrFields: {
        //       responseType: "blob", // To handle file downloads
        //     },
        //     success: function (response) {
        //       // Create a link element, trigger the download, and remove the element
        //       // const url = window.URL.createObjectURL(new Blob([response]));
        //       // const a = document.createElement("a");
        //       // a.href = url;
        //       // a.download = "certificate.pdf"; // Adjust filename if needed
        //       // document.body.appendChild(a);
        //       // a.click();
        //       // document.body.removeChild(a);
        //       // window.URL.revokeObjectURL(url);
        //       const url = window.URL.createObjectURL(new Blob([response]));
        //       const a = document.createElement("a");
        //       a.href = url;
        //       a.download = "certificate.pdf"; // Adjust filename if needed
        //       document.body.appendChild(a);
        //       a.click();
        //       document.body.removeChild(a);
        //       window.URL.revokeObjectURL(url);

        //       // Add success notification
        //       alert("Certificate downloaded successfully!");

        //       // Optionally disable the download button to prevent repeated downloads
        //       $(`button[data-id="${certificateId}"]`).prop("disabled", true);
        //     },
        //     error: function (error) {
        //       console.error("Error downloading certificate:", error);
        //       alert(
        //         "Failed to download the certificate. Please try again later or contact support."
        //       );
        //     },
        //   });
        // };

        const handleDownload = (certificateId) => {
          if (confirm("Are you sure you want to resubmit?")) {
            $.ajax({
              url: `${downloadUrl}${certificateId}`,
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              xhrFields: {
                responseType: "blob",
              },
              success: function (response) {
                const url = window.URL.createObjectURL(new Blob([response]));
                const a = document.createElement("a");
                a.href = url;
                a.download = "certificate.pdf";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
              },
              error: function (xhr) {
                const response = xhr.responseJSON;
                if (response && response.message) {
                  alert(response.message); // Show the error message from the backend
                } else {
                  // alert("An unexpected error occurred. Please try again.");
                  alert(" Certificate has already been downloaded.");
                }
              },
            });
          }
        };

        // Add click event listeners for download buttons
        $(".btn-download").click(function () {
          const certificateId = $(this).data("id");
          // if (certificateId) handleDownload(certificateId);

          const button = $(this);
          if (certificateId) {
            button.prop("disabled", true); // Disable the button
            handleDownload(certificateId);
            setTimeout(() => button.prop("disabled", false), 5000); // Re-enable after 5 seconds (optional)
          }
        });
      },

      error: function (error) {
        $("#name").text("Error loading profile");
      },
    });
    // Open resubmission modal
    $(document).on("click", ".resubmit-btn", function () {
      resubmitId = $(this).data("id");
      $("#resubmitName").val($(this).data("name"));
      $("#resubmitModal").modal("show");
    });
    // Submit resubmission
    $("#submitResubmission").click(function () {
      const updatedName = $("#resubmitName").val();
      if (confirm("Are you sure you want to resubmit?")) {
        $.ajax({
          url: `${BACKEND_URL}/indigene/certificate/${resubmitId}/resubmit`,
          method: "POST",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify({ firstname: updatedName }),
          success: function () {
            $("#resubmitModal").modal("hide");
            fetchData();
          },
          error: function (xhr) {
            console.log(xhr.responseJSON);
            // alert(xhr.responseJSON?.message || "Failed to resubmit request.");
            alert("Failed to resubmit. Maximum resubmission attempts reached");
          },
        });
      }
    });
  }
  // Initial fetch
  fetchData();
});

$(document).ready(function () {
  let downloadUrl = `${BACKEND_URL}/indigene/certificate/download/`;
  let currentPage = 1;
  const pageSize = 10;

  function fetchData(page) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/approval?page=${page}&limit=${pageSize}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (response) {
        const { data, hasNextPage } = response;

        const tableBody = $("#approval-table");
        tableBody.empty();

        data.forEach((item, index) => {
          // Attach an event handler to trigger the download with authentication
          tableBody.append(`
            <tr>
              <td>${(page - 1) * pageSize + index + 1}</td>
              <td>${item.firstname} ${item.lastname}</td>
              <td>${item.phone}</td>
              <td>${item.email}</td>
              <td>${item.status}</td>
              <td>
                <button class="btn btn-xs download-btn" data-id="${
                  item._id
                }">Download Certificate</button>
              </td>
            </tr>
          `);
        });

        // Add click event listeners for download buttons
        $(".download-btn").click(function () {
          const certificateId = $(this).data("id");
          $.ajax({
            url: `${downloadUrl}${certificateId}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            xhrFields: {
              responseType: "blob", // To handle file downloads
            },
            success: function (data) {
              // Create a link element, trigger the download, and remove the element
              const url = window.URL.createObjectURL(new Blob([data]));
              const a = document.createElement("a");
              a.href = url;
              a.download = `certificate.pdf`; // Adjust filename if needed
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            },
            error: function (error) {
              console.error("Error downloading certificate:", error);
            },
          });
        });

        // Update button states
        $("#btnPrev").prop("disabled", page === 1);
        $("#btnNext").prop("disabled", !hasNextPage);

        // document.getElementById("approvals").innerHTML = data.length; // Update the count of approvals
      },
      error: function (error) {
        console.error("Error fetching data:", error);
      },
    });
  }

  $("#btnPrev").click(function () {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage);
    }
  });

  $("#btnNext").click(function () {
    currentPage++;
    fetchData(currentPage);
  });

  // Initial data load
  fetchData(currentPage);
});

// Session Recovery Script: Check if user is logged in
// function checkSession() {
//   const token = localStorage.getItem("token");
//   if (!token) {
//     window.location.href = "login.html";
//   }
// }
// checkSession(); // Call the function to check the session

// $(document).ready(function () {
//   if (token) {
//     $.ajax({
//       url: `${BACKEND_URL}/auth/session`,
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       success: function (response) {
//         console.log(response);
//         $("#welcomeMessage").text(`Welcome, ${response.user.lastname}!`);
//         $("#loginSection").hide();
//         $("#dashboard").show();
//       },
//       error: function (error) {
//         console.log(error);
//         localStorage.removeItem("token"); // Clear invalid token
//       },
//     });
//   } else {
//     $("#loginSection").show();
//     $("#dashboard").hide();
//   }
// });

// JavaScript data for states and local governments
const nigeriaData = {
  adamawa: [
    "Demsa",
    "Fufure",
    "Ganye",
    "Gayuk",
    "Gombi",
    "Grie",
    "Hong",
    "Jada",
    "Larmurde",
    "Madagali",
    "Maiha",
    "Mayo Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  akwa_ibom: [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono-Ibom",
    "Ikot Abasi",
    "Ika",
    "Ikono",
    "Ikot Ekpene",
    "Ini",
    "Mkpat-Enin",
    "Itu",
    "Mbo",
    "Nsit-Atai",
    "Nsit-Ibom",
    "Nsit-Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Udung-Uko",
    "Ukanafun",
    "Oruk Anam",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],
  anambra: [
    "Aguata",
    "Anambra East",
    "Anaocha",
    "Awka North",
    "Anambra West",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  abia: [
    "Aba North",
    "Arochukwu",
    "Aba South",
    "Bende",
    "Isiala Ngwa North",
    "Ikwuano",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],
  bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],
  benue: [
    "Agatu",
    "Apa",
    "Ado",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Oturkpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],
  borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Guzamala",
    "Gubio",
    "Hawul",
    "Gwoza",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Mobbar",
    "Marte",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],
  bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],
  cross_river: [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakuur",
    "Yala",
  ],
  delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope West",
    "Ethiope East",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ukwuani",
    "Ughelli South",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],
  ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Ebonyi",
    "Afikpo South",
    "Ezza North",
    "Ikwo",
    "Ezza South",
    "Ivo",
    "Ishielu",
    "Izzi",
    "Ohaozara",
    "Ohaukwu",
    "Onicha",
  ],
  edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba Okha",
    "Orhionmwon",
    "Oredo",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],
  ekiti: [
    "Ado Ekiti",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ikole",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],
  enugu: [
    "Awgu",
    "Aninri",
    "Enugu East",
    "Enugu North",
    "Ezeagu",
    "Enugu South",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Udenu",
    "Oji River",
    "Uzo Uwani",
    "Udi",
  ],
  abuja: [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
  ],
  gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],
  jigawa: [
    "Auyo",
    "Babura",
    "Buji",
    "Biriniwa",
    "Birnin Kudu",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Kaugama",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Sule Tankarkar",
    "Roni",
    "Ringim",
    "Yankwashi",
    "Taura",
  ],
  lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Badagry",
    "Apapa",
    "Epe",
    "Eti Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Mushin",
    "Lagos Mainland",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere Lagos State",
  ],
  oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibarapa Central",
    "Ibadan South-West",
    "Ibarapa East",
    "Ido",
    "Ibarapa North",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
    "Oyo",
    "Oyo East",
    "Saki East",
    "Saki West",
    "Surulere Oyo State",
  ],
  imo: [
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Mbaitoli",
    "Isu",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Unuimo",
    "Owerri West",
  ],
  kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Ikara",
    "Igabi",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],
  kebbi: [
    "Aleiro",
    "Argungu",
    "Arewa Dandi",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Shanga",
    "Suru",
    "Sakaba",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],
  kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gezawa",
    "Gaya",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Takai",
    "Sumaila",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],
  kogi: [
    "Ajaokuta",
    "Adavi",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela Odolu",
    "Ijumu",
    "Kogi",
    "Kabba/Bunu",
    "Lokoja",
    "Ofu",
    "Mopa Muro",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],
  osun: [
    "Aiyedire",
    "Atakunmosa West",
    "Atakunmosa East",
    "Aiyedaade",
    "Boluwaduro",
    "Boripe",
    "Ife East",
    "Ede South",
    "Ife North",
    "Ede North",
    "Ife South",
    "Ejigbo",
    "Ife Central",
    "Ifedayo",
    "Egbedore",
    "Ila",
    "Ifelodun",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],
  sokoto: [
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamako",
    "Wurno",
    "Yabo",
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Goronyo",
    "Gada",
  ],
  plateau: [
    "Bokkos",
    "Barkin Ladi",
    "Bassa",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang South",
    "Langtang North",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],
  taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],
  yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],
  zamfara: [
    "Anka",
    "Birnin Magaji/Kiyaw",
    "Bakura",
    "Bukkuyum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Shinkafi",
    "Maru",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],
  katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Danja",
    "Dandume",
    "Dan Musa",
    "Daura",
    "Dutsi",
    "Dutsin Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],
  kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ilorin East",
    "Ifelodun",
    "Ilorin South",
    "Ekiti Kwara State",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],
  nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Lafia",
    "Kokona",
    "Nasarawa Egon",
    "Nasarawa",
    "Obi",
    "Toto",
    "Wamba",
  ],
  niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Mariga",
    "Magama",
    "Mokwa",
    "Mashegu",
    "Moya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],
  rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Andoni",
    "Akuku-Toru",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Emuoha",
    "Eleme",
    "Ikwerre",
    "Etche",
    "Gokana",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],
};

function updateLocalGovernments() {
  const stateSelect = document.getElementById("state");
  const lgaSelect = document.getElementById("lga");
  const selectedState = stateSelect.value;

  // Clear previous options
  lgaSelect.innerHTML = '<option value="">Select Local Government</option>';

  if (nigeriaData[selectedState]) {
    nigeriaData[selectedState].forEach((lga) => {
      const option = document.createElement("option");
      option.value = lga;
      option.textContent = lga;
      lgaSelect.appendChild(option);
    });
  }
}

// app.js

$(document).ready(function () {
  const nationalitySelect = $("#nationality");

  // Fetch list of countries from the REST Countries API
  $.ajax({
    url: "https://restcountries.com/v3.1/all",
    method: "GET",
    success: function (data) {
      // Loop through the data and append each country's name to the select dropdown
      data.forEach(function (country) {
        const countryName = country.name.common;
        const countryCode = country.cca2; // You can use country codes or other properties if needed
        nationalitySelect.append(new Option(countryName, countryCode));
      });
    },
    error: function () {
      alert("Failed to fetch countries data");
    },
  });
});
