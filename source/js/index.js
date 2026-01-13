const isDevelopment = window.location.hostname === "127.0.0.1";

const BACKEND_URL = isDevelopment
  ? "http://localhost:5000/api"
  : "https://api.citizenship.benuestate.gov.ng/api";

const FRONTEND_URL = isDevelopment
  ? "http://127.0.0.1:5503"
  : "https://citizenship.benuestate.gov.ng";

// Get user info from localStorage
const userData = JSON.parse(localStorage.getItem("token") || "{}");
const { token, user } = userData;

/**
 * Renders a PDF page responsively into a specified container.
 * It adjusts the scale to fit the container width and re-renders on window resize.
 * @param {string} url - The URL to the PDF file (can be a blob URL).
 * @param {HTMLElement} container - The DOM element where the PDF will be rendered.
 */
async function loadPDFJ(url, container) {
  let pdfDoc = null;
  let canvas = null;
  let ctx = null;

  /**
   * Renders the PDF page with the current container width.
   */
  const renderPage = async () => {
    if (!pdfDoc || !canvas) return;

    try {
      const page = await pdfDoc.getPage(1);

      // Get the container's current width
      const containerWidth = container.clientWidth;

      // Calculate the scale to fit the container width
      // We start with a scale of 1 to get the page's original dimensions
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;

      // Re-calculate viewport with the new, responsive scale
      const responsiveViewport = page.getViewport({ scale: scale });

      // Set canvas dimensions to match the scaled viewport
      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * scale * outputScale);
      canvas.height = Math.floor(viewport.height * scale * outputScale);
      canvas.style.width = Math.floor(viewport.width * scale) + "px";
      canvas.style.height = Math.floor(viewport.height * scale) + "px";

      // Scale the drawing context to match the device pixel ratio for sharpness
      ctx.scale(outputScale, outputScale);

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: ctx,
        viewport: responsiveViewport,
      };
      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering PDF page:", error);
    }
  };

  /**
   * Event handler for window resizing.
   */
  const handleResize = () => {
    renderPage();
  };

  try {
    container.innerHTML = `<p class="text-center">Loading PDF...</p>`;

    const loadingTask = pdfjsLib.getDocument(url);
    pdfDoc = await loadingTask.promise;

    // Set up canvas
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    container.innerHTML = ""; // Clear loading message
    container.appendChild(canvas);

    // Initial render
    renderPage();

    // Add resize listener to make it responsive
    window.addEventListener("resize", handleResize);

    // --- IMPORTANT: CLEANUP ---
    // When the modal is hidden, remove the resize listener to prevent memory leaks.
    // This assumes your modal has the ID 'viewModal'.
    const viewModal = document.getElementById("viewModal");
    const cleanup = () => {
      window.removeEventListener("resize", handleResize);
      viewModal.removeEventListener("hide.bs.modal", cleanup);
    };
    viewModal.addEventListener("hide.bs.modal", cleanup);
  } catch (error) {
    console.error("Error loading PDF:", error);
    container.innerHTML = `<div class="alert alert-danger">Failed to load PDF. <a href="${url}" target="_blank" class="btn btn-sm btn-primary mt-2">Open in New Tab</a></div>`;
  }
}

/**
 * Renders an image into a specified container.
 * @param {string} url - The URL to the image file (can be a blob URL).
 * @param {HTMLElement} container - The DOM element where the image will be rendered.
 */
function loadImage(url, container) {
  const img = document.createElement("img");
  img.src = url;
  // Use Bootstrap's responsive image class for a responsive view
  img.className = "img-fluid d-block mx-auto";
  img.style.maxHeight = "400px"; // Consistent max height with PDF viewer
  container.innerHTML = ""; // Clear the loading spinner
  container.appendChild(img);
}

/**
 * Triggers the download of a file (PDF or image) from a URL.
 */
function downloadFile(buttonElement) {
  const url = buttonElement.dataset.url;
  const docIndex = buttonElement.dataset.docIndex;
  const filename = `document-${docIndex}`; // The browser will handle the correct file type/extension

  fetch(url, {
    headers: { Authorization: apiHeaders.Authorization },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // Clean up
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
      alert("Failed to download the document.");
    });
}

/**
 * Renders an image into a specified container.
 */
function loadImage(url, container) {
  const img = document.createElement("img");
  img.src = url;
  img.className = "img-fluid"; // Makes the image responsive
  img.style.maxHeight = "400px"; // Consistent max height with PDF viewer
  img.style.display = "block"; // Removes bottom space under image
  img.style.margin = "auto"; // Centers the image
  container.innerHTML = ""; // Clear the loading spinner
  container.appendChild(img);
}

/**
 * Triggers the download of a file (PDF or image) from a URL.
 */
function downloadFile(buttonElement) {
  const url = buttonElement.dataset.url;
  const docIndex = buttonElement.dataset.docIndex;
  const filename = `document-${docIndex}`; // The browser will handle the correct file type/extension

  fetch(url, {
    headers: { Authorization: apiHeaders.Authorization },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl); // Clean up
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
      alert("Failed to download the document.");
    });
}

function downloadPDF(button) {
  const url = button.getAttribute("data-url");
  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Download failed");
      return res.blob();
    })
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `document-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    })
    .catch((err) => {
      console.error("Download error:", err.message);
      alert("Failed to download the document.");
    });
}

$(document).ready(function () {
  const userRole = user.role || "";
  $("#header-user-label").text(user.firstname);

  // Sidebar label
  $("#sidebar-user-label").text(
    ["super_admin", "support_admin", "kindred_head"].includes(userRole)
      ? "Administration"
      : "User"
  );

  // First, hide all role-specific menus
  $(
    ".nav-item.user-menu, .nav-item.kindred_head, .nav-item.support-admin-menu, .nav-item.super-admin-menu"
  ).hide();

  // Show only what’s allowed per role
  switch (userRole) {
    case "user":
      $(".nav-item.user-menu").show();
      break;

    case "kindred_head":
      $(".nav-item.kindred_head").show();
      // Also show 'profile.html' from user-menu
      $('.nav-item.user-menu:has(a[href="profile.html"])').show();
      break;

    case "support_admin":
      $(".nav-item.support-admin-menu").show();
      $('.super-admin-menu:has(a[href="index.html"])').show(); // optional if present
      break;

    case "super_admin":
      $(".nav-item.super-admin-menu").show();
      break;

    default:
      console.warn("Unknown role:", userRole);
  }
});

function generatePaymentReference() {
  return "ref-" + Date.now() + "-" + Math.random().toString(36).substr(2, 8);
}

$(document).ready(function () {
  const allowedState = "benue"; // Change to the allowed state

  if (!user || user.stateOfOrigin !== allowedState) {
    // Restrict access to Certificate Request Page and Request Page
    $('a[href="certificate.html"], a[href="request.html"]').click(function (
      event
    ) {
      event.preventDefault(); // Prevent navigation
      alert(
        "Access Denied: Only users from " +
          allowedState +
          " can access this page."
      );
    });

    // Redirect if the user tries to access exactly "certificate.html" or "request.html"
    const restrictedPages = ["certificate.html", "request.html"];
    const currentPage = window.location.pathname.split("/").pop(); // Get the actual page name

    if (restrictedPages.includes(currentPage)) {
      alert("Access Denied: You are not authorized to view this page.");
      window.location.href = "index.html"; // Redirect to Dashboard
    }
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

  // Fetch user details on page load
  $.ajax({
    url: `${BACKEND_URL}/users/${user.id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      // $("#lga-headquaters").text(
      //   data.lga?.headquaters ? `Headquarters ${data.lga.headquaters}` : ""
      // );

      // $("#lga-name").text(data.lga?.name ?? "")

      if (data.lga?.name) {
        $("#lga-info").show();
        $("#lga-name").text(data.lga.name);
        if (data.lga.headquaters) {
          $("#lga-headquaters").text(data.lga.headquaters);
        } else {
          $("#lga-headquaters").text("").hide(); // hide if no HQ
        }
      } else {
        $("#lga-info").hide(); // hide entire block if no name
      }

      // Check if healthInfo exists and is an array
      if (
        data.healthInfo &&
        Array.isArray(data.healthInfo) &&
        data.healthInfo.length > 0
      ) {
        // Access the first object in the healthInfo array
        const healthInfo = data.healthInfo[0];
        const { bloodGroup, genotype, disabilityStatus } = healthInfo;

        // Set the selected value for Blood Group
        if (bloodGroup) {
          $("#bloodGroup").val(bloodGroup).change();
        }

        // Set the selected value for Genotype
        if (genotype) {
          $("#genotype").val(genotype).change();
        }

        // Set the selected value for Disability Status
        if (disabilityStatus) {
          $("#disabilityStatus").val(disabilityStatus).change();
        }
      }

      // Handle identification type (including 'others')
      const predefinedIds = [
        "national_id",
        "driver_licence",
        "international_passport",
        "voters_card",
      ];
      const idValue = data.identification;

      if (idValue && !predefinedIds.includes(idValue)) {
        // This is a custom "others" value
        $("#identification").val("others").change(); // This triggers the display of the other field
        $("#other_identification").val(idValue); // Populate the custom value
      } else {
        // Standard identification type
        $("#identification").val(idValue).change();
      }

      // Set the value in the select field
      $("#maritalStatus").val(data.maritalStatus).change();
      $("#gender").val(data.gender).change();
      $("#stateOfOrigin").val(data.stateOfOrigin).change();
      $("#lgaOfOrigin").val(data.lgaOfOrigin).change();
      $("#stateOfResidence").val(data.stateOfResidence).change();
      $("#lgaOfResidence").val(data.lgaOfResidence).change();
      $("#countryOfResidence").val(data.countryOfResidence).change();

      $("#religion").val(data.religion).change();
      $("#dob").val(data.DOB).change();

      // Handle business data (since it's an array)
      if (data.business && data.business.length > 0) {
        const bizData = data.business[0]; // Get first business entry
        $("#biz_type").val(bizData.biz_type).change();
        $("#nature_of_business").val(bizData.nature_of_business).change();
        // Add other business fields if needed
      }

      // $(".selectpicker").selectpicker("refresh");

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
        community,
        religion,
        address,
        nextOfKin = [],
        business = [],
        maritalStatus,
        house_number,
        street_name,
        nearest_bus_stop_landmark,
        city_town,
        countryOfResidence,
        id_number,
        issue_date,
        expiry_date,
      } = data;

      // Populate main fields
      const mainFields = {
        first_name: firstname,
        lastname: lastname,
        address: address,
        email: email,
        middlename: middlename,
        phone: phone,
        stateOfOrigin: stateOfOrigin,
        lga: LGA,
        gender: gender,
        DOB: DOB,
        maritalStatus: maritalStatus,
        nationality: nationality,
        community: community,
        religion: religion,
        house_number: house_number,
        street_name: street_name,
        nearest_bus_stop_landmark: nearest_bus_stop_landmark,
        city_town: city_town,
        countryOfResidence: countryOfResidence,
        id_number: id_number,
        issue_date: issue_date,
        expiry_date: expiry_date,
        community: community,
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
        nok_countryOfResidence: "nok_countryOfResidence",
        nok_stateOfResidence: "nok_stateOfResidence",
        nok_lgaOfResidence: "nok_lgaOfResidence",
        nok_cityOfResidence: "nok_cityOfResidence",
        nok_address: "nok_address",
      });

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
        annualRevenue: "annualRevenue",
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

  const pageSize = 10; // Number of users per page

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

  const updateTable = (data, page) => {
    const tableBody = $("#table-body");
    tableBody.empty(); // Clear existing table rows
    data.forEach((item, index) => {
      const rowHtml = `
        <tr class="align-middle">
          <td class="fw-semibold">${(page - 1) * pageSize + index + 1}</td>
          <td>${item.firstname} ${item.lastname}</td>
          <td>${item.stateOfOrigin}</td>
          <td>${item.lgaOfOrigin}</td>
          <td>${item.lga?.name ?? "Not Assigned"}</td>
          <td>
            <span class="badge bg-secondary text-capitalize">${item.role}</span>
          </td>
     
          
          <td>
            <button class="btn btn-sm btn-primary view-user-btn" 
                    data-id="${item._id}" title="View User">
              <i class="fas fa-eye me-1"></i>
            </button>
          </td>
        </tr>`;
      tableBody.append(rowHtml);
    });
  };

  // // Fetch user data for the current page
  // const fetchUsersData = (page) => {
  //   const url = `${BACKEND_URL}/users?page=${page}&limit=${pageSize}`;
  //   const headers = { Authorization: `Bearer ${token}` };

  //   apiRequest(url, "GET", headers, null, (response) => {
  //     const { data, hasNextPage } = response;
  //     const now = new Date();
  //     const currentMonth = now.getMonth();
  //     const currentYear = now.getFullYear();

  //     const { activeCount, inactiveCount, newThisMonthCount } = data.reduce(
  //       (acc, user) => {
  //         // Count active/inactive users
  //         if (user.isActive) {
  //           acc.activeCount++;
  //         } else {
  //           acc.inactiveCount++;
  //         }

  //         // Count users created this month
  //         const createdAt = new Date(user.created_at);
  //         if (
  //           createdAt.getMonth() === currentMonth &&
  //           createdAt.getFullYear() === currentYear
  //         ) {
  //           acc.newThisMonthCount++;
  //         }

  //         return acc;
  //       },
  //       { activeCount: 0, inactiveCount: 0, newThisMonthCount: 0 }
  //     );

  //     updateTable(data, page);
  //     $("#prev-btn-users").prop("disabled", page <= 1);
  //     $("#next-btn-users").prop("disabled", !hasNextPage);
  //     $("#usercount").text(data.length);
  //     $(".usercount").text(data.length);
  //     $(".isActive").text(activeCount);
  //     $("#inActive").text(inactiveCount);
  //     $("#new-this-month").text(newThisMonthCount);
  //   });
  // };
  // // })

  // Update the role of a specific user to any valid role
  const updateRole = (userId, newRole, lgaId = null) => {
    if (!userId || !newRole) {
      alert("Invalid user ID or role.");
      return;
    }

    const url = `${BACKEND_URL}/users/${userId}/role`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const data = JSON.stringify({ role: newRole, lgaId: lgaId || null });

    apiRequest(
      url,
      "PATCH",
      headers,
      data,
      () => {
        alert("Role updated successfully!");
        fetchUsersData(currentPage.value);
      },
      () => alert("Failed to update role.")
    );
  };
  $(document).ready(function () {
    fetchUsersData();
  });

  const viewDetails = (userId) => {
    const url = `${BACKEND_URL}/users/${userId}`;
    const headers = { Authorization: `Bearer ${token}` };

    apiRequest(url, "GET", headers, null, (response) => {
      const roleOptions = [
        "user",
        "support_admin",
        "super_admin",
        "kindred_head",
      ];

      // Fetch LGAs dynamically
      apiRequest(`${BACKEND_URL}/lgas`, "GET", headers, null, (lgas) => {
        const { data } = lgas;

        // Find the LGA object that matches the user's lgaOfOrigin
        const originLga = data.find(
          (lga) =>
            lga.name.toLowerCase() === response.lgaOfOrigin?.toLowerCase()
        );

        const lgaSelect = originLga
          ? `
      <select id="lga-select" class="form-select mt-2" style="display:none;">
        <option value="${originLga._id}" selected>${originLga.name}</option>
      </select>
    `
          : `
      <p class="text-danger mt-2">No matching LGA of origin found!</p>
    `;
        const roleSelect = `
        <select id="new-role" class="form-select">
          ${roleOptions
            .map(
              (role) =>
                `<option value="${role}" ${
                  role === response.role ? "selected" : ""
                }>${role}</option>`
            )
            .join("")}
        </select>
        ${lgaSelect}
        <button class="btn btn-primary mt-2 update-role-modal-btn" data-id="${userId}">
          Update Role
        </button>
      `;

        const details = `
        <div class="user-profile">
          <div class="profile-header">
            <img 
              src="${response.passportPhoto || "/assets/images/avatar.jpeg"}" 
              alt="Passport Photo" 
              class="profile-photo" 
              crossOrigin="anonymous"
            >
            <h2 class="profile-name">${response.firstname} ${
          response.lastname
        }</h2>
            <p class="profile-role">Current Role: ${response.role}</p>
          </div>
          <div class="profile-details">
            <p><strong>Email:</strong> ${response.email}</p>
            <p><strong>Phone:</strong> ${response.phone}</p>
          </div>
          <div class="profile-role-update mt-3">
            ${roleSelect}
          </div>
        </div>
      `;

        $("#details-modal .modal-body").html(details);
        $("#details-modal").modal("show");

        // Show/hide LGA select based on role selection
        $("#new-role").on("change", function () {
          if ($(this).val() === "support_admin") {
            $("#lga-select").show();
          } else {
            $("#lga-select").hide().val("");
          }
        });

        // If already support_admin, show LGA select
        if (response.role === "support_admin") {
          $("#lga-select").show();
        }
      });
    });
  };

  // Handle role + LGA update
  $("#details-modal").on("click", ".update-role-modal-btn", function () {
    const userId = $(this).data("id");
    const newRole = $("#new-role").val();
    const lgaId = $("#lga-select").val();

    updateRole(userId, newRole, lgaId);
  });

  // Handle view details button clicks
  $("#table-body").on("click", ".view-user-btn", function () {
    const userId = $(this).data("id");
    viewDetails(userId);
  });

  // Handle pagination
  $("#prev-btn-users").on("click", function () {
    if (currentPage.value > 1) {
      currentPage.value--;
      fetchData(currentPage.value);
    }
  });

  $("#next-btn-users").on("click", function () {
    currentPage.value++;
    fetchData(currentPage.value);
  });
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

// PDF.js Loader
function loadPDFJS(pdfUrl, container) {
  const loader = document.getElementById("pdf-loader");
  if (!window["pdfjsLib"]) {
    container.innerHTML = `<iframe src="${pdfUrl}" width="100%" height="100%"></iframe>`;
    return;
  }

  const pdfjsLib = window["pdfjsLib"];
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

  let pdfDoc = null;
  let pageNum = 1;
  let scale = 1.2;

  const renderPage = (num) => {
    loader.style.display = "block";

    pdfDoc.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      container.innerHTML = "";
      container.appendChild(canvas);

      page.render(renderContext).promise.finally(() => {
        loader.style.display = "none";
      });
    });
  };

  const createControls = () => {
    const controls = document.createElement("div");
    controls.className =
      "d-flex justify-content-between align-items-center mb-2";

    controls.innerHTML = `
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" id="prevPage">Prev</button>
          <button class="btn btn-sm btn-outline-primary" id="nextPage">Next</button>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-2" id="zoomOut">-</button>
          <button class="btn btn-sm btn-outline-secondary" id="zoomIn">+</button>
        </div>
      `;

    container.before(controls);

    controls.querySelector("#prevPage").addEventListener("click", () => {
      if (pageNum <= 1) return;
      pageNum--;
      renderPage(pageNum);
    });

    controls.querySelector("#nextPage").addEventListener("click", () => {
      if (pageNum >= pdfDoc.numPages) return;
      pageNum++;
      renderPage(pageNum);
    });

    controls.querySelector("#zoomOut").addEventListener("click", () => {
      scale = Math.max(scale - 0.2, 0.5);
      renderPage(pageNum);
    });

    controls.querySelector("#zoomIn").addEventListener("click", () => {
      scale = Math.min(scale + 0.2, 3);
      renderPage(pageNum);
    });
  };

  loader.style.display = "block";

  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  loadingTask.promise
    .then((pdf) => {
      pdfDoc = pdf;
      createControls();
      renderPage(pageNum);
    })
    .catch((error) => {
      loader.style.display = "none";
      console.error("Error rendering PDF:", error);
      container.innerHTML = `<iframe src="${pdfUrl}" width="100%" height="100%"></iframe>`;
    });
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
      const statusBadge = {
        Approved: `<span class="badge rounded-pill bg-success">Approved</span>`,
        Pending: `<span class="badge rounded-pill bg-warning text-dark">Pending</span>`,
        Rejected: `<span class="badge rounded-pill bg-danger">Rejected</span>`,
      };

      tableBody.append(`
        <tr data-id="${item._id}">
         <td>${(currentPage - 1) * pageSize + index + 1}</td>
          <td>${item.firstname} ${item.lastname}</td>
          <td>${item.phone}</td>
          <td>${item.isVerified}</td>
          <td>${statusBadge[item.status] || item.status}</td>
          <td>
            <button class="btn btn-sm btn-success btn-cert-approve" data-id="${
              item._id
            }" title="Approve">
              <i class="fas fa-check"></i>
            </button>
            <button class="btn btn-sm btn-warning btn-cert-view" data-id="${
              item._id
            }" title="View">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-cert-reject" data-id="${
              item._id
            }" title="Reject" ${item.status === "Rejected" ? "disabled" : ""}>
              <i class="fas fa-times"></i>
            </button>
          </td>
        </tr>
      `);
    });
  }

  // function fetchData(page) {
  //   $.ajax({
  //     url: `${BACKEND_URL}/indigene/certificate/request?page=${page}&limit=${pageSize}&statuses=Pending,Rejected`,
  //     method: "GET",
  //     headers: apiHeaders,
  //     success: function (response) {
  //       const { data, hasNextPage } = response;
  //       // console.log("data", data);
  //       $("#cert-request").text(data.length);

  //       renderTable(data);
  //       updatePaginationButtons(hasNextPage);
  //       updateRequestCount(data.length);

  //       let pendingCount = 0;
  //       let rejectedCount = 0;

  //       data.forEach((element) => {
  //         if (element.status === "Pending") {
  //           pendingCount++;
  //         }
  //         if (element.status === "Rejected") {
  //           rejectedCount++;
  //         }
  //       });

  //       $("#pending").text(pendingCount);
  //       $("#rejected").text(rejectedCount);
  //     },
  //     error: function (error) {
  //       console.error("Error fetching data:", error);
  //     },
  //   });
  // }

  // function handleApproval(requestId) {
  //   $.ajax({
  //     url: `${BACKEND_URL}/indigene/certificate/${requestId}/approve`,
  //     method: "PATCH",
  //     headers: apiHeaders,
  //     success: function () {
  //       fetchData(currentPage);
  //     },
  //     error: function (error) {
  //       console.error("Error approving request:", error);
  //     },
  //   });
  // }

  // function handleRejection(rejectionReason) {
  //   if (!rejectionReason) {
  //     alert("Please provide a rejection reason.");
  //     return;
  //   }

  //   $.ajax({
  //     url: `${BACKEND_URL}/indigene/certificate/${rejectionId}/reject`,
  //     method: "PATCH",
  //     contentType: "application/json",
  //     data: JSON.stringify({ rejectionReason }),
  //     headers: apiHeaders,
  //     success: function () {
  //       $("#rejectionModal").modal("hide");
  //       $("#rejectionReason").val("");
  //       fetchData(currentPage);
  //     },
  //     error: function (error) {
  //       console.error("Error rejecting request:", error);
  //     },
  //   });
  // }

  function handleVerification(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${requestId}/verify`,
      method: "PATCH",
      headers: apiHeaders,
      success: function () {
        Swal.fire("Success", "Request successfully verified", "success");
        fetchData(currentPage);
      },
      error: function (error) {
        Swal.fire("Oops...", "Request successfully verified", "error");
      },
    });
  }

  function handleView(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/indigene/certificate/${requestId}/request`,
      method: "GET",
      headers: apiHeaders,
      success: function (response) {
        const docTypes = ["idCard", "birthCertificate"];
        const documentTitles = ["Identity Card", "Birth Certificate"];

        // Filter documents that actually exist in response
        const validDocuments = docTypes
          .map((key, index) => ({ key, title: documentTitles[index] }))
          .filter((doc) => response[doc.key]);

        let modalContent = `
        <div class="container-fluid">
          <div class="row mb-3">
            <div class="col-md-3 text-center">
              <img 
                src="${response.passportPhoto || "/assets/images/avatar.jpeg"}" 
                alt="Passport Photo" 
                class="img-fluid rounded shadow-sm profile-photo"
                style="max-height: 150px;"
                crossOrigin="anonymous"
              >
            </div>
            <div class="col-md-9">
              <h5 class="fw-bold mb-2">${response.firstname} ${
          response.lastname
        }</h5>
              <p class="mb-1"><strong>Phone:</strong> ${response.phone}</p>
              <p class="mb-1"><strong>Email:</strong> ${response.email}</p>
              <p class="mb-1"><strong>Status:</strong> <span class="badge bg-info">${
                response.status
              }</span></p>
              <p><strong>State:</strong> ${response.stateOfOrigin}</p>
              <p><strong>LGA:</strong> ${response.lgaOfOrigin}</p>
              <p><strong>Kindred:</strong> ${response.kindred}</p>
              <p><strong>isProfileCompleted:</strong> ${
                response.userId?.isProfileCompleted
              }</p>
            </div>
          </div>
  
          <hr class="my-3">
          <h6 class="text-primary">Uploaded Documents</h6>
      `;

        if (validDocuments.length === 0) {
          modalContent += `<p class="text-muted">No documents uploaded.</p>`;
        }

        // Generate HTML for each existing document
        validDocuments.forEach((doc, index) => {
          const fileUrl = `${BACKEND_URL}/indigene/certificate/${requestId}/document/${doc.key}`;

          modalContent += `
          <div class="card my-3 shadow-sm">
            <div class="card-header bg-light fw-semibold">
              ${doc.title}
            </div>
            <div class="card-body p-0"> <!-- Use p-0 for full-width viewer -->
              <!-- Renamed ID for clarity, added responsive container -->
              <div id="viewer-container-${index}" style="width:100%; max-height:75vh; overflow:auto;" class="border bg-light p-2"></div>
              <div class="p-2 text-end">
                 <button class="btn btn-sm btn-outline-primary me-2" onclick="window.open('${fileUrl}', '_blank')">Open in New Tab</button>
                 <!-- Updated onclick to call the generic downloadFile function -->
                 <button class="btn btn-sm btn-outline-secondary" data-doc-index="${index}" data-url="${fileUrl}" onclick="downloadFile(this)">Download</button>
              </div>
            </div>
          </div>
        `;
        });

        modalContent += `</div>`;
        $("#viewModal .modal-body").html(modalContent);
        $("#viewModal").modal("show");

        // Load documents with authorization and type-checking
        validDocuments.forEach((doc, index) => {
          const fileUrl = `${BACKEND_URL}/indigene/certificate/${requestId}/document/${doc.key}`;
          const container = document.getElementById(
            `viewer-container-${index}`
          );

          // Show loader while fetching
          container.innerHTML = `
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        `;

          // Fetch document with authorization
          fetch(fileUrl, {
            headers: {
              Authorization: apiHeaders.Authorization,
            },
          })
            .then((res) => {
              if (!res.ok) throw new Error("Failed to fetch document");

              // --- KEY LOGIC: Get the content type from the response header ---
              const contentType = res.headers.get("Content-Type");

              // Return both the blob and the content type for the next .then()
              return res.blob().then((blob) => ({ blob, contentType }));
            })
            .then(({ blob, contentType }) => {
              const blobUrl = URL.createObjectURL(blob);

              // --- Check the content type and call the correct renderer ---
              if (contentType === "application/pdf") {
                loadPDFJ(blobUrl, container);
              } else if (contentType && contentType.startsWith("image/")) {
                loadImage(blobUrl, container);
              } else {
                // Handle unknown or missing content type
                throw new Error(
                  `Unsupported file type: ${contentType || "Unknown"}`
                );
              }
            })
            .catch((err) => {
              console.error(`Error loading document [${doc.key}]:`, err);
              container.innerHTML = `
              <div class="alert alert-danger m-2">
                Failed to load document: ${err.message}
                <div class="mt-2">
                  <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary">Try Opening in New Tab</a>
                </div>
              </div>
            `;
            });
        });
      },
      error: function (error) {
        console.error("Error fetching request details:", error);
        alert("Failed to fetch request details.");
      },
    });
  }

  $(document).on("click", ".btn-cert-approve", function () {
    const requestId = $(this).data("id");
    handleApproval(requestId);
  });

  $(document).on("click", ".btn-cert-verify", function () {
    const requestId = $(this).data("id");
    handleVerification(requestId);
  });

  $(document).on("click", ".btn-cert-reject", function () {
    rejectionId = $(this).data("id");
    $("#rejectionModal").modal("show");
  });

  $("#certificatesTable").on("click", ".btn-cert-view", function () {
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
        const requiredDocs = ["birthCertificate", "idCard", "passportPhoto"];

        let uploadedCount = 0;

        requiredDocs.forEach((doc) => {
          if (data[doc]) {
            uploadedCount++;
          }
        });

        const totalRequired = requiredDocs.length;

        if (uploadedCount === totalRequired) {
          $(".upload-status-text")
            .removeClass()
            .addClass("text-success small upload-status-text")
            .text("All documents uploaded");
        } else if (uploadedCount > 0) {
          $(".upload-status-text")
            .removeClass()
            .addClass("text-warning small upload-status-text")
            .text("Documents partially uploaded");
        } else {
          $(".upload-status-text")
            .removeClass()
            .addClass("text-muted small upload-status-text")
            .text("No documents uploaded");
        }

        // Update your DOM
        $(".uploaded-count").text(`${uploadedCount} of ${totalRequired}`);

        const tableBody = $("#request-table");
        tableBody.empty();

        const resubmissionAttempts = data.resubmissionAttempts || 0;

        const appendRow = (isDisabled, showPayButton) => {
          // Initialize tooltips immediately after appending
          var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
          );
          tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
          });
          tableBody.append(`
            <tr>
              <td>${data.firstname} ${data.lastname}</td>
              <td>${data.phone}</td>
              <td>${data.email}</td>
              <td><span class="badge bg-${
                data.status === "Approved"
                  ? "success"
                  : data.status === "Rejected"
                  ? "danger"
                  : "warning"
              }">${data.status}</span></td>
              <td>${resubmissionAttempts}</td>
              <td>
                <div id="loadingIndicator" style="display: none;">
                  <div class="loader"></div>
                    <div class="loading-message">Loading...</div>
                </div>
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-bars"></i> Options
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                    <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
                      <button class="dropdown-item btn-cert-download" data-id="${
                        data._id
                      }" ${isDisabled ? "disabled" : ""}>
                        <i class="fas fa-download text-success"></i> Download Certificate
                      </button>
                       ${
                         isDisabled
                           ? `<span class="custom-tooltip">Please pay before downloading</span>`
                           : ""
                       }
                    </li>
                    <li>
                    <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
                      <button class="dropdown-item view-cert-btn" data-id="${
                        data._id
                      }" ${isDisabled ? "disabled" : ""}>
                        <i class="fas fa-eye text-primary"></i> View Certificate
                      </button>
                        ${
                          isDisabled
                            ? `<span class="custom-tooltip">Please pay to view certificate</span>`
                            : ""
                        }
                    </li>
                    ${
                      data.status === "Rejected" && data.resubmissionAllowed
                        ? `<li><button class="dropdown-item resubmit-btn" data-id="${data._id}" data-name="${data.firstname}">
                            <i class="fas fa-sync-alt text-warning"></i> Resubmit
                          </button></li>`
                        : ""
                    }
                    ${
                      data.status === "Rejected"
                        ? `<li><button class="dropdown-item delete-btn" data-id="${data._id}">
                            <i class="fas fa-trash-alt text-danger"></i> Delete Request
                          </button></li>`
                        : ""
                    }
                    ${
                      showPayButton
                        ? `<li><button class="dropdown-item btn-cert-pay" data-id="${data._id}">
                            <i class="fas fa-credit-card text-info"></i> Pay
                          </button></li>`
                        : ""
                    }
                  </ul>
                </div>
              </td>
            </tr>
          `);
        };
        $(".certificate-status").text(data.status);
        $("#profile-status").text(
          data.userId?.isProfileCompleted
            ? "Profile Completed"
            : "Profile Incomplete"
        );

        if (data.status === "Rejected" || data.status === "Pending") {
          appendRow(true, false);
        } else if (data.status === "Approved") {
          $.ajax({
            url: `${BACKEND_URL}/transaction/${user.id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            success: function (transactions) {
              let matchingTransaction = transactions.find(
                (t) => t.certificateId === data._id
              );

              if (matchingTransaction) {
                if (matchingTransaction.status === "success") {
                  appendRow(false, false);
                } else {
                  appendRow(true, true);
                }
              } else {
                // No matching transaction for this certificate
                appendRow(true, true);
              }
            },
            error: function (error) {
              console.error("Error fetching transaction status:", error);
              appendRow(true, true); // Fallback to safe state
            },
          });
        }

        // Attach click event to view-cert-btn
        $(document).on("click", ".download-btn", function () {
          const certificateId = $(this).data("id");
          window.location.href = `cert-temp.html?id=${certificateId}`;
        });

        // Handle Certificate Download
        async function handleDownload(certificateId) {
          if (
            !confirm(
              "Warning! Sure you want to download? Click ok to continue or else click cancel."
            )
          ) {
            return;
          }

          try {
            // Show loading indicator with download text
            showLoadingIndicator(" Downloading document, please wait,...");

            const blob = await fetchCertificatePdf(certificateId);

            triggerDownload(blob, "certificate.pdf");

            showSuccessMessage("Certificate downloaded successfully!");
          } catch (error) {
            const errorMessage =
              error.responseJSON?.message ||
              "Download window has expired. Please request a new certificate.";
            showErrorMessage(errorMessage);
          } finally {
            hideLoadingIndicator();
          }
        }

        function fetchCertificatePdf(certificateId) {
          return new Promise((resolve, reject) => {
            $.ajax({
              url: `${downloadUrl}${certificateId}`,
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              xhrFields: {
                responseType: "blob",
              },
              success: resolve,
              error: reject,
            });
          });
        }

        function triggerDownload(blob, fileName) {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }

        function showLoadingIndicator(message = "Loading...") {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
            // Update the loading text if there's a message element
            const messageElement =
              loadingIndicator.querySelector(".loading-message");
            if (messageElement) {
              messageElement.textContent = message;
            }
            loadingIndicator.style.display = "flex";
          }
        }

        function hideLoadingIndicator() {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
            loadingIndicator.style.display = "none";
          }
        }

        function showSuccessMessage(message) {
          console.log("Success:", message);
          alert(message);
        }

        function showErrorMessage(message) {
          console.error("Error:", message);
          alert(message);
        }

        // Add click event listeners for download buttons
        $(document).on("click", ".btn-cert-download", function () {
          const certificateId = $(this).data("id");
          const button = $(this);

          if (certificateId) {
            button.prop("disabled", true);
            handleDownload(certificateId);
            setTimeout(() => button.prop("disabled", false), 5000); // Optional: Re-enable after 5 seconds
          }
        });
      },
      error: function (error) {
        $("#name").text("Error loading profile");
      },
    });

    $(document).on("click", ".resubmit-btn", function () {
      resubmitId = $(this).data("id");
      $("#resubmitName").val($(this).data("name"));
      $("#resubmitModal").modal("show");
    });

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
            alert("Failed to resubmit. Maximum resubmission attempts reached");
          },
        });
      }
    });

    function handleDelete(certificateId) {
      if (confirm("Are you sure you want to delete this Request")) {
        $.ajax({
          url: `${BACKEND_URL}/indigene/certificate/${certificateId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          success: function () {
            Swal.fire("Request", "Successfully Deleted!", "success");
          },
          error: function (error) {
            console.error("Error deleting request:", error);
          },
        });
      }
    }

    $(document).on("click", ".delete-btn", function () {
      const requestId = $(this).data("id");
      handleDelete(requestId);
    });
  }

  function initiatePayment(certificateId) {
    // Define the amount clearly (5000 Naira in this case)
    const amountInNaira = 5000; // Display value

    // Show confirmation with amount before proceeding
    if (
      !confirm(
        `You are about to pay ₦${amountInNaira} for your ID card. Proceed to payment?`
      )
    ) {
      return;
    }
    // Retrieve user authentication data
    if (!userData?.token || !userData?.user?.id) {
      Swal.fire("Error", "User authentication failed!", "error");
      return;
    }

    const { token, user } = userData;
    const userId = user.id;
    const email = user.email;
    const firstName = user.firstname || "User";
    const lastName = user.lastname || " ";
    const phone = user.phone || "0000000000";
    const amount = 500000; // In kobo
    const reference = generatePaymentReference(); // Unique for each attempt

    if (!token) {
      alert("Please log in to proceed with payment");
      return;
    }

    $.ajax({
      url: `${BACKEND_URL}/transaction/pay`,
      method: "POST",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: JSON.stringify({
        certificateId,
        userId,
        amount,
        email,
        paymentType: "certificate", // ✅ FIX: Include paymentType to match backend expectations
        reference,
      }),
      success: function (response) {
        console.log("response", response);
        if (response.status === 200 && response.data?.reference) {
          const paymentRef = response.data.reference;

          const handler = CredoWidget.setup({
            key: "0PUB0972HedMpDz1VtV8El1zNNC6m9Ji",
            customerFirstName: firstName,
            customerLastName: lastName,
            email: email,
            amount: amount,
            currency: "NGN",
            renderSize: 0,
            channels: ["card", "bank"],
            reference: paymentRef,
            customerPhoneNumber: phone,
            callbackUrl: `${FRONTEND_URL}/app/success.html`,
            onClose: function () {
              console.log("Payment widget closed");
            },
            callBack: function (response) {
              window.location.href = `${FRONTEND_URL}/app/success.html`;
            },
          });

          handler.openIframe();
        } else {
          alert("Payment initiation failed!");
        }
      },
      error: function (error) {
        console.error("Error initiating payment:", error);
        alert("Failed to initiate payment. Please try again.");
      },
    });
  }

  // Event listener for certificate payment buttons
  $(document).on("click", ".btn-cert-pay", function () {
    const certificateId = $(this).data("id");
    initiatePayment(certificateId);
  });

  fetchData();

  // Initialize tooltips after content is rendered
  $(document).ajaxStop(function () {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  });
});

// Download Cert
// $(document).ready(function () {
//   let downloadUrl = `${BACKEND_URL}/indigene/certificate/download/`;
//   let currentPage = 1;
//   const pageSize = 10;

//   function fetchData(page) {
//     $.ajax({
//       url: `${BACKEND_URL}/indigene/certificate/approval?page=${page}&limit=${pageSize}`,
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       success: function (response) {
//         const { data, hasNextPage } = response;

//         const tableBody = $("#approval-table");
//         tableBody.empty();

//         data.forEach((item, index) => {
//           // Attach an event handler to trigger the download with authentication
//           tableBody.append(`
//             <tr>
//               <td>${(page - 1) * pageSize + index + 1}</td>
//               <td>${item.firstname} ${item.lastname}</td>
//               <td>${item.phone}</td>
//               <td>${item.email}</td>
//               <td>${item.status}</td>
//               <td>
//                 <button class="btn btn-xs download-btn" data-id="${
//                   item._id
//                 }">Download Certificate</button>
//               </td>
//             </tr>
//           `);
//         });

//         // Add click event listeners for download buttons
//         $(".download-btn").click(function () {
//           const certificateId = $(this).data("id");
//           $.ajax({
//             url: `${downloadUrl}${certificateId}`,
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//             xhrFields: {
//               responseType: "blob", // To handle file downloads
//             },
//             success: function (data) {
//               // Create a link element, trigger the download, and remove the element
//               const url = window.URL.createObjectURL(new Blob([data]));
//               const a = document.createElement("a");
//               a.href = url;
//               a.download = `certificate.pdf`; // Adjust filename if needed
//               document.body.appendChild(a);
//               a.click();
//               document.body.removeChild(a);
//               window.URL.revokeObjectURL(url);
//             },
//             error: function (xhr) {
//               const errorMessage = xhr.responseJSON
//                 ? xhr.responseJSON.message
//                 : "Failed to change password";
//               alert(errorMessage);
//             },
//           });
//         });

//         // Update button states
//         $("#btnPrev").prop("disabled", page === 1);
//         $("#btnNext").prop("disabled", !hasNextPage);
//         $("#approvals").text(data.length);
//       },
//       error: function (error) {
//         console.error("Error fetching data:", error);
//       },
//     });
//   }

//   $("#btnPrev").click(function () {
//     if (currentPage > 1) {
//       currentPage--;
//       fetchData(currentPage);
//     }
//   });

//   $("#btnNext").click(function () {
//     currentPage++;
//     fetchData(currentPage);
//   });

//   // Initial data load
//   fetchData(currentPage);
// });

// $(document).ready(function () {
//   $.ajax({
//     url: `${BACKEND_URL}/indigene/certificate/latest`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (latestCertificate) {
//       // Function to format time ago
//       /**
//        * Formats the time difference between now and the given date.
//        * @param {string} date - The date to compare with the current time.
//        * @returns {string} - A human-readable string representing the time difference.
//        */
//       function timeAgo(date) {
//         const now = new Date();
//         const updated = new Date(date);
//         const diff = Math.floor((now - updated) / 1000); // in seconds

//         if (diff < 60) return "just now";
//         if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
//         if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
//         if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
//         return updated.toLocaleDateString(); // fallback to actual date
//       }

//       if (latestCertificate) {
//         // Handle the single latest record
//         $("#latest-cert-request").text(
//           latestCertificate.firstname + " " + latestCertificate.lastname
//         );

//         $("#cert-pending").text(latestCertificate.status);

//         const updatedTime = timeAgo(latestCertificate.updated_at);
//         $(".cert-pending-date").text(updatedTime);
//       } else {
//         console.log("No approved certificates found");
//       }
//     },
//     error: function (error) {
//       console.error("Error fetching latest certificate:", error);
//     },
//   });
// });

// $(document).ready(function () {
//   $.ajax({
//     url: `${BACKEND_URL}/idcard/latest`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (latestCard) {
//       function timeAgo(date) {
//         const now = new Date();
//         const updated = new Date(date);
//         const diff = Math.floor((now - updated) / 1000); // in seconds

//         if (diff < 60) return "just now";
//         if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
//         if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
//         if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
//         return updated.toLocaleDateString(); // fallback to actual date
//       }

//       // Handle the single latest record
//       $("#latest-card-request").text(
//         latestCard.firstname + " " + latestCard.lastname
//       );

//       $("#card-pending").text(latestCard.status);
//       const updatedTime = timeAgo(latestCard.updated_at);
//       $(".card-pending-date").text(updatedTime);
//     },
//     error: function (error) {
//       console.error("Error fetching latest card:", error);
//     },
//   });
//   // }
// });

// $(document).ready(function () {
//   $.ajax({
//     url: `${BACKEND_URL}/indigene/certificate/latest-approved`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (certificate) {
//       function timeAgo(date) {
//         const now = new Date();
//         const updated = new Date(date);
//         const diff = Math.floor((now - updated) / 1000); // in seconds

//         if (diff < 60) return "just now";
//         if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
//         if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
//         if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
//         return updated.toLocaleDateString(); // fallback to actual date
//       }

//       if (certificate) {
//         // Update UI with this single record
//         $("#latest-cert-approved").text(
//           certificate.firstname + " " + certificate.lastname
//         );
//         $("#cert-approved").text(certificate.status);

//         const updatedTime = timeAgo(certificate.updated_at);
//         $(".cert-approved-date").text(updatedTime);
//       } else {
//         console.log("No approved certificates found");
//       }
//     },
//     error: function (error) {
//       console.error("Error:", error);
//     },
//   });
// });

// $(document).ready(function () {
//   $.ajax({
//     url: `${BACKEND_URL}/idcard/latest-approved`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (card) {
//       function timeAgo(date) {
//         const now = new Date();
//         const updated = new Date(date);
//         const diff = Math.floor((now - updated) / 1000); // in seconds

//         if (diff < 60) return "just now";
//         if (diff < 3600) return `${Math.floor(diff / 60)} minute(s) ago`;
//         if (diff < 86400) return `${Math.floor(diff / 3600)} hour(s) ago`;
//         if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
//         return updated.toLocaleDateString(); // fallback to actual date
//       }
//       if (card) {
//         // Update UI with this single record
//         $("#latest-card-approved").text(card.firstname + " " + card.lastname);
//         $("#card-approved").text(card.status);
//         const updatedTime = timeAgo(card.updated_at);
//         $(".card-approved-date").text(updatedTime);
//       } else {
//         console.log("No approved card found");
//       }
//     },
//     error: function (error) {
//       console.error("Error:", error);
//     },
//   });
// });

// LGA Data for Nigeria
// const nigeriaData = {
//   adamawa: [
//     "Demsa",
//     "Fufure",
//     "Ganye",
//     "Gayuk",
//     "Gombi",
//     "Grie",
//     "Hong",
//     "Jada",
//     "Larmurde",
//     "Madagali",
//     "Maiha",
//     "Mayo Belwa",
//     "Michika",
//     "Mubi North",
//     "Mubi South",
//     "Numan",
//     "Shelleng",
//     "Song",
//     "Toungo",
//     "Yola North",
//     "Yola South",
//   ],
//   akwa_ibom: [
//     "Abak",
//     "Eastern Obolo",
//     "Eket",
//     "Esit Eket",
//     "Essien Udim",
//     "Etim Ekpo",
//     "Etinan",
//     "Ibeno",
//     "Ibesikpo Asutan",
//     "Ibiono-Ibom",
//     "Ikot Abasi",
//     "Ika",
//     "Ikono",
//     "Ikot Ekpene",
//     "Ini",
//     "Mkpat-Enin",
//     "Itu",
//     "Mbo",
//     "Nsit-Atai",
//     "Nsit-Ibom",
//     "Nsit-Ubium",
//     "Obot Akara",
//     "Okobo",
//     "Onna",
//     "Oron",
//     "Udung-Uko",
//     "Ukanafun",
//     "Oruk Anam",
//     "Uruan",
//     "Urue-Offong/Oruko",
//     "Uyo",
//   ],
//   anambra: [
//     "Aguata",
//     "Anambra East",
//     "Anaocha",
//     "Awka North",
//     "Anambra West",
//     "Awka South",
//     "Ayamelum",
//     "Dunukofia",
//     "Ekwusigo",
//     "Idemili North",
//     "Idemili South",
//     "Ihiala",
//     "Njikoka",
//     "Nnewi North",
//     "Nnewi South",
//     "Ogbaru",
//     "Onitsha North",
//     "Onitsha South",
//     "Orumba North",
//     "Orumba South",
//     "Oyi",
//   ],
//   abia: [
//     "Aba North",
//     "Arochukwu",
//     "Aba South",
//     "Bende",
//     "Isiala Ngwa North",
//     "Ikwuano",
//     "Isiala Ngwa South",
//     "Isuikwuato",
//     "Obi Ngwa",
//     "Ohafia",
//     "Osisioma",
//     "Ugwunagbo",
//     "Ukwa East",
//     "Ukwa West",
//     "Umuahia North",
//     "Umuahia South",
//     "Umu Nneochi",
//   ],
//   bauchi: [
//     "Alkaleri",
//     "Bauchi",
//     "Bogoro",
//     "Damban",
//     "Darazo",
//     "Dass",
//     "Gamawa",
//     "Ganjuwa",
//     "Giade",
//     "Itas/Gadau",
//     "Jama'are",
//     "Katagum",
//     "Kirfi",
//     "Misau",
//     "Ningi",
//     "Shira",
//     "Tafawa Balewa",
//     "Toro",
//     "Warji",
//     "Zaki",
//   ],
//   benue: [
//     "Agatu",
//     "Apa",
//     "Ado",
//     "Buruku",
//     "Gboko",
//     "Guma",
//     "Gwer East",
//     "Gwer West",
//     "Katsina-Ala",
//     "Konshisha",
//     "Kwande",
//     "Logo",
//     "Makurdi",
//     "Obi",
//     "Ogbadibo",
//     "Ohimini",
//     "Oju",
//     "Okpokwu",
//     "Oturkpo",
//     "Tarka",
//     "Ukum",
//     "Ushongo",
//     "Vandeikya",
//   ],
//   borno: [
//     "Abadam",
//     "Askira/Uba",
//     "Bama",
//     "Bayo",
//     "Biu",
//     "Chibok",
//     "Damboa",
//     "Dikwa",
//     "Guzamala",
//     "Gubio",
//     "Hawul",
//     "Gwoza",
//     "Jere",
//     "Kaga",
//     "Kala/Balge",
//     "Konduga",
//     "Kukawa",
//     "Kwaya Kusar",
//     "Mafa",
//     "Magumeri",
//     "Maiduguri",
//     "Mobbar",
//     "Marte",
//     "Monguno",
//     "Ngala",
//     "Nganzai",
//     "Shani",
//   ],
//   bayelsa: [
//     "Brass",
//     "Ekeremor",
//     "Kolokuma/Opokuma",
//     "Nembe",
//     "Ogbia",
//     "Sagbama",
//     "Southern Ijaw",
//     "Yenagoa",
//   ],
//   cross_river: [
//     "Abi",
//     "Akamkpa",
//     "Akpabuyo",
//     "Bakassi",
//     "Bekwarra",
//     "Biase",
//     "Boki",
//     "Calabar Municipal",
//     "Calabar South",
//     "Etung",
//     "Ikom",
//     "Obanliku",
//     "Obubra",
//     "Obudu",
//     "Odukpani",
//     "Ogoja",
//     "Yakuur",
//     "Yala",
//   ],
//   delta: [
//     "Aniocha North",
//     "Aniocha South",
//     "Bomadi",
//     "Burutu",
//     "Ethiope West",
//     "Ethiope East",
//     "Ika North East",
//     "Ika South",
//     "Isoko North",
//     "Isoko South",
//     "Ndokwa East",
//     "Ndokwa West",
//     "Okpe",
//     "Oshimili North",
//     "Oshimili South",
//     "Patani",
//     "Sapele",
//     "Udu",
//     "Ughelli North",
//     "Ukwuani",
//     "Ughelli South",
//     "Uvwie",
//     "Warri North",
//     "Warri South",
//     "Warri South West",
//   ],
//   ebonyi: [
//     "Abakaliki",
//     "Afikpo North",
//     "Ebonyi",
//     "Afikpo South",
//     "Ezza North",
//     "Ikwo",
//     "Ezza South",
//     "Ivo",
//     "Ishielu",
//     "Izzi",
//     "Ohaozara",
//     "Ohaukwu",
//     "Onicha",
//   ],
//   edo: [
//     "Akoko-Edo",
//     "Egor",
//     "Esan Central",
//     "Esan North-East",
//     "Esan South-East",
//     "Esan West",
//     "Etsako Central",
//     "Etsako East",
//     "Etsako West",
//     "Igueben",
//     "Ikpoba Okha",
//     "Orhionmwon",
//     "Oredo",
//     "Ovia North-East",
//     "Ovia South-West",
//     "Owan East",
//     "Owan West",
//     "Uhunmwonde",
//   ],
//   ekiti: [
//     "Ado Ekiti",
//     "Efon",
//     "Ekiti East",
//     "Ekiti South-West",
//     "Ekiti West",
//     "Emure",
//     "Gbonyin",
//     "Ido Osi",
//     "Ijero",
//     "Ikere",
//     "Ilejemeje",
//     "Irepodun/Ifelodun",
//     "Ikole",
//     "Ise/Orun",
//     "Moba",
//     "Oye",
//   ],
//   enugu: [
//     "Awgu",
//     "Aninri",
//     "Enugu East",
//     "Enugu North",
//     "Ezeagu",
//     "Enugu South",
//     "Igbo Etiti",
//     "Igbo Eze North",
//     "Igbo Eze South",
//     "Isi Uzo",
//     "Nkanu East",
//     "Nkanu West",
//     "Nsukka",
//     "Udenu",
//     "Oji River",
//     "Uzo Uwani",
//     "Udi",
//   ],
//   abuja: [
//     "Abaji",
//     "Bwari",
//     "Gwagwalada",
//     "Kuje",
//     "Kwali",
//     "Municipal Area Council",
//   ],
//   gombe: [
//     "Akko",
//     "Balanga",
//     "Billiri",
//     "Dukku",
//     "Funakaye",
//     "Gombe",
//     "Kaltungo",
//     "Kwami",
//     "Nafada",
//     "Shongom",
//     "Yamaltu/Deba",
//   ],
//   jigawa: [
//     "Auyo",
//     "Babura",
//     "Buji",
//     "Biriniwa",
//     "Birnin Kudu",
//     "Dutse",
//     "Gagarawa",
//     "Garki",
//     "Gumel",
//     "Guri",
//     "Gwaram",
//     "Gwiwa",
//     "Hadejia",
//     "Jahun",
//     "Kafin Hausa",
//     "Kazaure",
//     "Kiri Kasama",
//     "Kiyawa",
//     "Kaugama",
//     "Maigatari",
//     "Malam Madori",
//     "Miga",
//     "Sule Tankarkar",
//     "Roni",
//     "Ringim",
//     "Yankwashi",
//     "Taura",
//   ],
//   lagos: [
//     "Agege",
//     "Ajeromi-Ifelodun",
//     "Alimosho",
//     "Amuwo-Odofin",
//     "Badagry",
//     "Apapa",
//     "Epe",
//     "Eti Osa",
//     "Ibeju-Lekki",
//     "Ifako-Ijaiye",
//     "Ikeja",
//     "Ikorodu",
//     "Kosofe",
//     "Lagos Island",
//     "Mushin",
//     "Lagos Mainland",
//     "Ojo",
//     "Oshodi-Isolo",
//     "Shomolu",
//     "Surulere Lagos State",
//   ],
//   oyo: [
//     "Afijio",
//     "Akinyele",
//     "Atiba",
//     "Atisbo",
//     "Egbeda",
//     "Ibadan North",
//     "Ibadan North-East",
//     "Ibadan North-West",
//     "Ibadan South-East",
//     "Ibarapa Central",
//     "Ibadan South-West",
//     "Ibarapa East",
//     "Ido",
//     "Ibarapa North",
//     "Irepo",
//     "Iseyin",
//     "Itesiwaju",
//     "Iwajowa",
//     "Kajola",
//     "Lagelu",
//     "Ogbomosho North",
//     "Ogbomosho South",
//     "Ogo Oluwa",
//     "Olorunsogo",
//     "Oluyole",
//     "Ona Ara",
//     "Orelope",
//     "Ori Ire",
//     "Oyo",
//     "Oyo East",
//     "Saki East",
//     "Saki West",
//     "Surulere Oyo State",
//   ],
//   imo: [
//     "Aboh Mbaise",
//     "Ahiazu Mbaise",
//     "Ehime Mbano",
//     "Ezinihitte",
//     "Ideato North",
//     "Ideato South",
//     "Ihitte/Uboma",
//     "Ikeduru",
//     "Isiala Mbano",
//     "Mbaitoli",
//     "Isu",
//     "Ngor Okpala",
//     "Njaba",
//     "Nkwerre",
//     "Nwangele",
//     "Obowo",
//     "Oguta",
//     "Ohaji/Egbema",
//     "Okigwe",
//     "Orlu",
//     "Orsu",
//     "Oru East",
//     "Oru West",
//     "Owerri Municipal",
//     "Owerri North",
//     "Unuimo",
//     "Owerri West",
//   ],
//   kaduna: [
//     "Birnin Gwari",
//     "Chikun",
//     "Giwa",
//     "Ikara",
//     "Igabi",
//     "Jaba",
//     "Jema'a",
//     "Kachia",
//     "Kaduna North",
//     "Kaduna South",
//     "Kagarko",
//     "Kajuru",
//     "Kaura",
//     "Kauru",
//     "Kubau",
//     "Kudan",
//     "Lere",
//     "Makarfi",
//     "Sabon Gari",
//     "Sanga",
//     "Soba",
//     "Zangon Kataf",
//     "Zaria",
//   ],
//   kebbi: [
//     "Aleiro",
//     "Argungu",
//     "Arewa Dandi",
//     "Augie",
//     "Bagudo",
//     "Birnin Kebbi",
//     "Bunza",
//     "Dandi",
//     "Fakai",
//     "Gwandu",
//     "Jega",
//     "Kalgo",
//     "Koko/Besse",
//     "Maiyama",
//     "Ngaski",
//     "Shanga",
//     "Suru",
//     "Sakaba",
//     "Wasagu/Danko",
//     "Yauri",
//     "Zuru",
//   ],
//   kano: [
//     "Ajingi",
//     "Albasu",
//     "Bagwai",
//     "Bebeji",
//     "Bichi",
//     "Bunkure",
//     "Dala",
//     "Dambatta",
//     "Dawakin Kudu",
//     "Dawakin Tofa",
//     "Doguwa",
//     "Fagge",
//     "Gabasawa",
//     "Garko",
//     "Garun Mallam",
//     "Gezawa",
//     "Gaya",
//     "Gwale",
//     "Gwarzo",
//     "Kabo",
//     "Kano Municipal",
//     "Karaye",
//     "Kibiya",
//     "Kiru",
//     "Kumbotso",
//     "Kunchi",
//     "Kura",
//     "Madobi",
//     "Makoda",
//     "Minjibir",
//     "Nasarawa",
//     "Rano",
//     "Rimin Gado",
//     "Rogo",
//     "Shanono",
//     "Takai",
//     "Sumaila",
//     "Tarauni",
//     "Tofa",
//     "Tsanyawa",
//     "Tudun Wada",
//     "Ungogo",
//     "Warawa",
//     "Wudil",
//   ],
//   kogi: [
//     "Ajaokuta",
//     "Adavi",
//     "Ankpa",
//     "Bassa",
//     "Dekina",
//     "Ibaji",
//     "Idah",
//     "Igalamela Odolu",
//     "Ijumu",
//     "Kogi",
//     "Kabba/Bunu",
//     "Lokoja",
//     "Ofu",
//     "Mopa Muro",
//     "Ogori/Magongo",
//     "Okehi",
//     "Okene",
//     "Olamaboro",
//     "Omala",
//     "Yagba East",
//     "Yagba West",
//   ],
//   osun: [
//     "Aiyedire",
//     "Atakunmosa West",
//     "Atakunmosa East",
//     "Aiyedaade",
//     "Boluwaduro",
//     "Boripe",
//     "Ife East",
//     "Ede South",
//     "Ife North",
//     "Ede North",
//     "Ife South",
//     "Ejigbo",
//     "Ife Central",
//     "Ifedayo",
//     "Egbedore",
//     "Ila",
//     "Ifelodun",
//     "Ilesa East",
//     "Ilesa West",
//     "Irepodun",
//     "Irewole",
//     "Isokan",
//     "Iwo",
//     "Obokun",
//     "Odo Otin",
//     "Ola Oluwa",
//     "Olorunda",
//     "Oriade",
//     "Orolu",
//     "Osogbo",
//   ],
//   sokoto: [
//     "Gudu",
//     "Gwadabawa",
//     "Illela",
//     "Isa",
//     "Kebbe",
//     "Kware",
//     "Rabah",
//     "Sabon Birni",
//     "Shagari",
//     "Silame",
//     "Sokoto North",
//     "Sokoto South",
//     "Tambuwal",
//     "Tangaza",
//     "Tureta",
//     "Wamako",
//     "Wurno",
//     "Yabo",
//     "Binji",
//     "Bodinga",
//     "Dange Shuni",
//     "Goronyo",
//     "Gada",
//   ],
//   plateau: [
//     "Bokkos",
//     "Barkin Ladi",
//     "Bassa",
//     "Jos East",
//     "Jos North",
//     "Jos South",
//     "Kanam",
//     "Kanke",
//     "Langtang South",
//     "Langtang North",
//     "Mangu",
//     "Mikang",
//     "Pankshin",
//     "Qua'an Pan",
//     "Riyom",
//     "Shendam",
//     "Wase",
//   ],
//   taraba: [
//     "Ardo Kola",
//     "Bali",
//     "Donga",
//     "Gashaka",
//     "Gassol",
//     "Ibi",
//     "Jalingo",
//     "Karim Lamido",
//     "Kumi",
//     "Lau",
//     "Sardauna",
//     "Takum",
//     "Ussa",
//     "Wukari",
//     "Yorro",
//     "Zing",
//   ],
//   yobe: [
//     "Bade",
//     "Bursari",
//     "Damaturu",
//     "Fika",
//     "Fune",
//     "Geidam",
//     "Gujba",
//     "Gulani",
//     "Jakusko",
//     "Karasuwa",
//     "Machina",
//     "Nangere",
//     "Nguru",
//     "Potiskum",
//     "Tarmuwa",
//     "Yunusari",
//     "Yusufari",
//   ],
//   zamfara: [
//     "Anka",
//     "Birnin Magaji/Kiyaw",
//     "Bakura",
//     "Bukkuyum",
//     "Bungudu",
//     "Gummi",
//     "Gusau",
//     "Kaura Namoda",
//     "Maradun",
//     "Shinkafi",
//     "Maru",
//     "Talata Mafara",
//     "Tsafe",
//     "Zurmi",
//   ],
//   katsina: [
//     "Bakori",
//     "Batagarawa",
//     "Batsari",
//     "Baure",
//     "Bindawa",
//     "Charanchi",
//     "Danja",
//     "Dandume",
//     "Dan Musa",
//     "Daura",
//     "Dutsi",
//     "Dutsin Ma",
//     "Faskari",
//     "Funtua",
//     "Ingawa",
//     "Jibia",
//     "Kafur",
//     "Kaita",
//     "Kankara",
//     "Kankia",
//     "Katsina",
//     "Kurfi",
//     "Kusada",
//     "Mai'Adua",
//     "Malumfashi",
//     "Mani",
//     "Mashi",
//     "Matazu",
//     "Musawa",
//     "Rimi",
//     "Sabuwa",
//     "Safana",
//     "Sandamu",
//     "Zango",
//   ],
//   kwara: [
//     "Asa",
//     "Baruten",
//     "Edu",
//     "Ilorin East",
//     "Ifelodun",
//     "Ilorin South",
//     "Ekiti Kwara State",
//     "Ilorin West",
//     "Irepodun",
//     "Isin",
//     "Kaiama",
//     "Moro",
//     "Offa",
//     "Oke Ero",
//     "Oyun",
//     "Pategi",
//   ],
//   nasarawa: [
//     "Akwanga",
//     "Awe",
//     "Doma",
//     "Karu",
//     "Keana",
//     "Keffi",
//     "Lafia",
//     "Kokona",
//     "Nasarawa Egon",
//     "Nasarawa",
//     "Obi",
//     "Toto",
//     "Wamba",
//   ],
//   niger: [
//     "Agaie",
//     "Agwara",
//     "Bida",
//     "Borgu",
//     "Bosso",
//     "Chanchaga",
//     "Edati",
//     "Gbako",
//     "Gurara",
//     "Katcha",
//     "Kontagora",
//     "Lapai",
//     "Lavun",
//     "Mariga",
//     "Magama",
//     "Mokwa",
//     "Mashegu",
//     "Moya",
//     "Paikoro",
//     "Rafi",
//     "Rijau",
//     "Shiroro",
//     "Suleja",
//     "Tafa",
//     "Wushishi",
//   ],
//   rivers: [
//     "Abua/Odual",
//     "Ahoada East",
//     "Ahoada West",
//     "Andoni",
//     "Akuku-Toru",
//     "Asari-Toru",
//     "Bonny",
//     "Degema",
//     "Emuoha",
//     "Eleme",
//     "Ikwerre",
//     "Etche",
//     "Gokana",
//     "Khana",
//     "Obio/Akpor",
//     "Ogba/Egbema/Ndoni",
//     "Ogu/Bolo",
//     "Okrika",
//     "Omuma",
//     "Opobo/Nkoro",
//     "Oyigbo",
//     "Port Harcourt",
//     "Tai",
//   ],
// };

// function updateLocalGovernmentsOfOrigin() {
//   const stateSelect = document.getElementById("stateOfOrigin");
//   const lgaSelect = document.getElementById("lgaOfOrigin");
//   const selectedState = stateSelect.value;

//   // Clear previous options
//   lgaSelect.innerHTML = '<option value="">Select Local Government</option>';

//   if (nigeriaData[selectedState]) {
//     nigeriaData[selectedState].forEach((lga) => {
//       const option = document.createElement("option");
//       option.value = lga;
//       option.textContent = lga;
//       lgaSelect.appendChild(option);
//     });
//   }
// }

// function updateLocalGovernmentsOfResidence() {
//   const stateSelect = document.getElementById("stateOfResidence");
//   const lgaSelect = document.getElementById("lgaOfResidence");
//   const selectedState = stateSelect.value;

//   // Clear previous options
//   lgaSelect.innerHTML = '<option value="">Select Local Government</option>';

//   if (nigeriaData[selectedState]) {
//     nigeriaData[selectedState].forEach((lga) => {
//       const option = document.createElement("option");
//       option.value = lga;
//       option.textContent = lga;
//       lgaSelect.appendChild(option);
//     });
//   }
// }

// Select country of residence

$(document).ready(function () {
  const countrySelect = $("#countryOfResidence");

  // Fetch user data from backend
  $.ajax({
    url: `${BACKEND_URL}/users/${user.id}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      const userCountryCode = data.countryOfResidence; // Ensure this key matches the backend response

      // Fetch list of countries from the REST Countries API
      $.ajax({
        url: "https://restcountries.com/v3.1/all?fields=name,countries",
        method: "GET",
        success: function (countries) {
          countries.forEach(function (country) {
            const countryName = country.name.common;
            const countryCode = country.cca2;
            countrySelect.append(new Option(countryName, countryCode));
          });

          // Set the user's country after the options are loaded
          if (userCountryCode) {
            countrySelect.val(userCountryCode);
          }
        },
        error: function () {
          console.log("Oops...", "Failed to fetch countries data", "error");
        },
      });
    },
    error: function (error) {
      const errorMessage =
        error.responseJSON?.message || "Failed to load user profile.";
      // Swal.fire("Oops...", errorMessage, "error");
      $("#name").text("Error loading profile");
    },
  });
});

function toggleOtherInput(selectElement) {
  const otherContainer = document.getElementById(
    "other-identification-container"
  );
  if (selectElement.value === "others") {
    otherContainer.style.display = "block";
  } else {
    otherContainer.style.display = "none";
    document.getElementById("other-identification").value = "";
  }
}

// find card by ID
$(document).ready(function () {
  let resubmitId = null;
  let downloadUrl = `${BACKEND_URL}/idcard/download/`;

  function fetchData() {
    $.ajax({
      url: `${BACKEND_URL}/idcard/${user.id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      success: function (data) {
        const tableBody = $("#card-table");
        tableBody.empty();

        const resubmissionAttempts = data.resubmissionAttempts || 0;

        // Helper function to append a row to the table
        const appendRow = (isDisabled, showPayButton) => {
          // Initialize tooltips immediately after appending
          var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
          );
          tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
          });
          tableBody.append(`
    <tr>
      <td>${data.firstname} ${data.lastname}</td>
      <td>${data.phone}</td>
      <td>${data.email}</td>
      <td><span class="badge bg-${
        data.status === "Approved"
          ? "success"
          : data.status === "Rejected"
          ? "danger"
          : "warning"
      }">${data.status}</span></td>
      <td>${resubmissionAttempts}</td>

      <td>
      <div id="loadingIndicator" style="display: none;">
      <div class="loader"></div>
        <div class="loading-message">Loading...</div>
     </div>
        <div class="dropdown">
           <button class="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-bars"></i> Options
           </button>
          <ul class="dropdown-menu">
            <li>
               <div class="tooltip-wrapper" style="position: relative; display: inline-block;">
              <button class="dropdown-item btn-card-download" data-id="${
                data._id
              }" ${isDisabled ? "disabled" : ""}>
                 <i class="fas fa-download text-success"></i>
                Download Card
              </button>
                  ${
                    isDisabled
                      ? `<span class="custom-tooltip">Please pay before downloading</span>`
                      : ""
                  }
            </li>
            <li>
               <div class="tooltip-wrapper" style="position: relative; display: inline-block;">              
               <button class="dropdown-item view-card-btn" data-id="${
                 data._id
               }"  ${isDisabled ? "disabled" : ""}>
               <i class="fas fa-eye text-primary"></i>  View Card
              </button>
              ${
                isDisabled
                  ? `<span class="custom-tooltip">Please pay to view card</span>`
                  : ""
              }
        
            </li>
            ${
              data.status === "Rejected" && data.resubmissionAllowed
                ? `<li><button class="dropdown-item resubmit-card-btn" data-id="${data._id}" data-name="${data.firstname}">
                    <i class="fas fa-sync-alt text-warning"></i>   Resubmit
                   </button></li>`
                : ""
            }
            
             ${
               data.status === "Rejected"
                 ? `<li><button class="dropdown-item delete-card-btn" data-id="${data._id}">
                <i class="fas fa-trash-alt text-danger"></i>  Delete request
               </button></li>`
                 : ""
             }

               ${
                 showPayButton
                   ? `<li> <button class="dropdown-item btn-card-pay" data-id="${data._id}">
                     <i class="fas fa-credit-card text-info"></i> Pay
                   </button>
                   </li>`
                   : ""
               }
            
          </ul>
        </div>
      </td>
    </tr>
  `);
        };

        $(".card-status").text(data.status);

        if (data.status === "Rejected" || data.status === "Pending") {
          appendRow(true, false);
        } else if (data.status === "Approved") {
          // Check if payment has been made
          $.ajax({
            url: `${BACKEND_URL}/transaction/${user.id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            success: function (transactions) {
              let matchingTransaction = transactions.find(
                (t) => t.cardId === data._id
              );
              if (matchingTransaction) {
                if (matchingTransaction.status === "success") {
                  appendRow(false, false);
                } else {
                  appendRow(true, true);
                }
              } else {
                // No transactions found, append row with pay button
                appendRow(true, true);
              }
            },
            error: function (error) {
              console.error("Error fetching transaction status:", error);
              appendRow(true, true);
            },
          });
        }

        // Attach click event to view-card-btn
        $(document).on("click", ".view-card-btn", function () {
          const cardId = $(this).data("id");
          window.location.href = `id-card-temp.html?id=${cardId}`;
        });

        // Handle card Download
        async function handleDownload(cardId) {
          if (
            !confirm(
              "Warning! Sure you want to download? Click ok to continue or else click cancel."
            )
          ) {
            return;
          }

          try {
            // Show loading indicator with download text
            showLoadingIndicator(" Downloading document, please wait,...");

            // Fetch the caed PDF
            const blob = await fetchCardPdf(cardId);

            // Trigger the download
            triggerDownload(blob, "card.pdf");

            // Notify the user of success
            showSuccessMessage("Card downloaded successfully!");
          } catch (error) {
            // Handle errors
            const errorMessage =
              // error.responseJSON?.message || "Failed to download the card.";
              error.responseJSON?.message || "Card Already Downloaded";

            showErrorMessage(errorMessage);
          } finally {
            // Hide loading indicator
            hideLoadingIndicator();
          }
        }

        function fetchCardPdf(cardId) {
          return new Promise((resolve, reject) => {
            $.ajax({
              url: `${downloadUrl}${cardId}`,
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              xhrFields: {
                responseType: "blob",
              },
              success: resolve,
              error: reject,
            });
          });
        }

        // Trigger the download of the PDF file
        function triggerDownload(blob, fileName) {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }

        // Show the loading indicator
        function showLoadingIndicator(message = "Loading...") {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
            // Update the loading text if there's a message element
            const messageElement =
              loadingIndicator.querySelector(".loading-message");
            if (messageElement) {
              messageElement.textContent = message;
            }
            loadingIndicator.style.display = "flex";
          }
        }

        // Hide the loading indicator
        function hideLoadingIndicator() {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
            loadingIndicator.style.display = "none";
          }
        }

        // Show a success message
        function showSuccessMessage(message) {
          alert(message); // Replace with a toast notification if needed
        }

        // Show an error message
        function showErrorMessage(message) {
          console.error("Error:", message);
          alert(message); // Replace with a toast notification if needed
        }

        // Add click event listeners for download buttons
        $(document).on("click", ".btn-card-download", function () {
          const cardId = $(this).data("id");
          const button = $(this);

          if (cardId) {
            button.prop("disabled", true);
            handleDownload(cardId);
            setTimeout(() => button.prop("disabled", false), 5000); // Optional: Re-enable after 5 seconds
          }
        });
      },

      error: function (error) {
        $("#name").text("Error loading profile");
      },
    });

    // Open resubmission modal
    $(document).on("click", ".resubmit-card-btn", function () {
      resubmitId = $(this).data("id");
      $("#resubmitCardName").val($(this).data("name"));
      $("#resubmitCardModal").modal("show");
    });
    // Submit resubmission
    $("#submitCardResubmission").click(function () {
      const updatedName = $("#resubmitCardName").val();
      if (confirm("Are you sure you want to resubmit?")) {
        $.ajax({
          url: `${BACKEND_URL}/idcard/${resubmitId}/resubmit`,
          method: "POST",
          contentType: "application/json",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: JSON.stringify({ firstname: updatedName }),
          success: function () {
            $("#resubmitCardModal").modal("hide");
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

    // Handle delete card
    function handleDelete(cardId) {
      if (confirm("Are you sure you want to delete this Request")) {
        $.ajax({
          url: `${BACKEND_URL}/idcard/${cardId}`,
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          success: function () {
            Swal.fire("Request", "Successfully Deleted!", "success");
            fetchData();
          },
          error: function (error) {
            console.error("Error deleting request:", error);
          },
        });
      }
    }

    $(document).on("click", ".delete-card-btn", function () {
      const requestId = $(this).data("id");
      handleDelete(requestId);
    });

    //Card Payment
    function initiateCardPayment(cardId) {
      // Define the amount clearly (5000 Naira in this case)
      const amountInNaira = 5000; // Display value

      // Show confirmation with amount before proceeding
      if (
        !confirm(
          `You are about to pay ₦${amountInNaira} for your ID card. Proceed to payment?`
        )
      ) {
        return;
      }
      // Retrieve user authentication data
      if (!userData?.token || !userData?.user?.id) {
        Swal.fire("Error", "User authentication failed!", "error");
        return;
      }
      const { token, user } = userData;

      const email = user.email;
      const userId = user.id;
      const firstName = user.firstname || "User";
      const lastName = user.lastname || " ";
      const phone = user.phone || "0000000000";
      const amount = 500000; // In kobo
      const reference = generatePaymentReference(); // Unique for each attempt

      if (!token) {
        alert("Please log in to proceed with payment");
        return;
      }
      $.ajax({
        url: `${BACKEND_URL}/transaction/pay`,
        method: "POST",
        contentType: "application/json",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: JSON.stringify({
          cardId,
          userId,
          amount,
          email,
          paymentType: "card", // ✅ FIX: Include paymentType to match backend expectations
          reference,
        }),
        success: function (response) {
          if (response.status === 200 && response.data?.reference) {
            const paymentRef = response.data.reference;

            const handler = CredoWidget.setup({
              key: "0PUB0972HedMpDz1VtV8El1zNNC6m9Ji",
              customerFirstName: firstName,
              customerLastName: lastName,
              email: email,
              amount: amount,
              currency: "NGN",
              renderSize: 0,
              channels: ["card", "bank"],
              reference: paymentRef,
              customerPhoneNumber: phone,
              callbackUrl: `${FRONTEND_URL}/app/success.html`,
              onClose: function () {
                console.log("Payment widget closed");
              },
              callBack: function (response) {
                window.location.href = `${FRONTEND_URL}/app/success.html`;
              },
            });

            handler.openIframe();
          } else {
            alert("Payment initiation failed!");
          }
        },
        error: function (error) {
          console.error("Error initiating payment:", error.message);
          alert("Failed to initiate payment. Please try again.");
        },
      });
    }

    $(document).on("click", ".btn-card-pay", function () {
      const cardId = $(this).data("id");
      initiateCardPayment(cardId);
    });
  }
  // Initial fetch
  fetchData();
});

// //Get All Transactions
$(document).ready(function () {
  // Track the current page and define the page size
  const currentPage = { value: 1 };
  const pageSize = 10;

  // Utility function to make API requests
  // const apiRequest = (
  //   url,
  //   method,
  //   headers = {},
  //   data = null,
  //   onSuccess,
  //   onError
  // ) => {
  //   $.ajax({
  //     url,
  //     method,
  //     headers,
  //     data,
  //     success: onSuccess,
  //     error: onError || ((error) => console.error("API Error:", error)),
  //   });
  // };

  // // Update the table with user data
  // const updateTable = (data, page) => {
  //   const tableBody = $("#transaction-table");
  //   tableBody.empty(); // Clear existing table rows

  //   // Populate table rows with user data
  //   data.forEach((item, index) => {
  //     const rowHtml = `
  //       <tr>
  //         <td>${(page - 1) * pageSize + index + 1}</td>
  //         <td>${item.paymentType}</td>
  //         <td>${item.amount}</td>
  //         <td>${item.email}</td>
  //         <td>${item.status}</td>
  //         <td>${item.reference}</td>

  //          <td>
  //          <button class="btn btn-sm verify-btn"
  //                   data-id="${item.reference}"
  //                   style="background-color: #007BFF; color: #fff">
  //             verify
  //           </button>
  //         </td>
  //       </tr>`;
  //     tableBody.append(rowHtml); // Add the row to the table
  //   });
  // };

  // Fetch user data for the current page
  // const fetchData = (page) => {
  //   const url = `${BACKEND_URL}/transaction?page=${page}&limit=${pageSize}`;
  //   const headers = { Authorization: `Bearer ${token}` };

  //   apiRequest(url, "GET", headers, null, (response) => {
  //     const { data, hasNextPage } = response;
  //     updateTable(data, page);
  //     // Calculate the total amount
  //     // Sum all amounts (in kobo) and convert to Naira
  //     let totalAmountKobo = 0;
  //     data.forEach((item) => {
  //       totalAmountKobo += item.amount; // Assuming `amount` is in kobo
  //     });

  //     const totalAmountNaira = totalAmountKobo / 100; // Convert to Naira

  //     // Function to format numbers as ₦ with K, M, B
  //     function formatCurrencyShort(amount) {
  //       if (amount >= 1_000_000_000) {
  //         return "₦" + (amount / 1_000_000_000).toFixed(1) + "B";
  //       } else if (amount >= 1_000_000) {
  //         return "₦" + (amount / 1_000_000).toFixed(1) + "M";
  //       } else if (amount >= 1_000) {
  //         return "₦" + (amount / 1_000).toFixed(1) + "K";
  //       } else {
  //         return "₦" + amount.toFixed(0);
  //       }
  //     }
  //     const formattedAmount = formatCurrencyShort(totalAmountNaira);
  //     $("#btnPrevTran").prop("disabled", page === 1);
  //     $("#btnNextTran").prop("disabled", !hasNextPage);
  //     $("#transaction").text(formattedAmount); // Display the total amount
  //   });
  // };

  // Fetch and display user details in a modern profile modal
  const verifyPayment = (reference) => {
    // Handle Verify Payment button clicks
    const verifyUrl = `${BACKEND_URL}/transaction/verify/${reference}`;

    $.ajax({
      url: verifyUrl,
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      success: function (response) {
        console.log(response);
        alert(`Payment verification result: ${response.message}`);
        // fetchData(); // Reload to update transaction status
      },
      error: function (error) {
        console.error("Verification Error:", error);
        alert("Failed to verify payment.");
      },
    });
  };

  // Handle view details button clicks
  $(document).on("click", ".verify-btn", function () {
    const reference = $(this).data("id");
    verifyPayment(reference);
  });
});

// Function to update the header title based on the current page
// function updateHeaderTitle() {
//   const path = window.location.pathname;
//   const page = path.split("/").pop().replace(".html", "");
//   const titleMap = {
//     index: "Admin Panel",
//     "user-dasboard": "User Dashboard",
//     approvals: "Approvals",
//     request: "View Certificate Status",
//     idcard: "View Card Status",
//     "all-request": "View Certificate Request",
//     "all-card": "View Card Request",
//     citizens: "Users",
//     certificate: "Request Certificate",
//     profile: "Profile",
//     transaction: "Transactions",
//     login: "Login",
//     card: "Request Card",
//     "support-admin-lga": "Admin LGAs",
//     "user-kindred": "Kindreds",
//     "user-kindred": "Kindreds",
//     "kindred-dasboard": "Kindred Head Dashboard",
//     "kindred-head": "View All Request",
//     kindred: "All Kindred Heads",
//   };

//   const pageTitle = titleMap[page] || "Dashboard";
//   document.title =
//     pageTitle +
//     " | Benue State Integrated Citizenship and Resident Identity Registration Management System";
//   document.querySelector(".dashboard_bar").textContent = pageTitle;
// }

// Call the function when the page loads
// document.addEventListener("DOMContentLoaded", updateHeaderTitle);

let currentPageAll = 1;
let currentPageUser = 1;
const pageSize = 10;

// Get All kindred
// function fetchAllKindred(page) {
//   $.ajax({
//     url: `${BACKEND_URL}/kindred?page=${page}&limit=${pageSize}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (response) {
//       const { data, hasNextPage } = response;

//       const tableBody = $("#kindred-table");
//       tableBody.empty();

//       data.forEach((item, index) => {
//         tableBody.append(`
//             <tr>
//               <td>${(page - 1) * pageSize + index + 1}</td>
//               <td>${item.firstname} ${item.lastname}</td>
//               <td>${item.phone}</td>
//               <td>${item.address}</td>
//               <td>${item.kindred}</td>
//               <td>${item.lga}</td>

//             </tr>
//           `);
//       });

//       $("#kindred-btn-prev").prop("disabled", page === 1);
//       $("#kindred-btn-next").prop("disabled", !hasNextPage);
//     },
//     error: function (error) {
//       console.error("Error fetching all kindred:", error);
//     },
//   });
// }

// //Fetch kindred by userId
// function fetchUserKindred(page) {
//   $.ajax({
//     url: `${BACKEND_URL}/kindred/${user.id}?page=${page}&limit=${pageSize}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (response) {
//       const { data, hasNextPage } = response;
//       const tableBody = $("#user-kindred-table");
//       tableBody.empty();

//       data.forEach((data, index) => {
//         tableBody.append(`
//           <tr>
//             <td>${(page - 1) * pageSize + index + 1}</td>
//             <td>${data.firstname} ${data.lastname}</td>
//             <td>${data.phone}</td>
//             <td>${data.address}</td>
//             <td>${data.kindred}</td>
//             <td>${data.lga}</td>
//             <td>
//               <div class="dropdown">
//                 <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
//                   <i class="fas fa-ellipsis-v"></i>
//                 </button>
//                 <ul class="dropdown-menu">
//                   <li>
//                     <button class="dropdown-item update-user-btn" data-id="${
//                       data._id
//                     }" data-info='${JSON.stringify(data)}'>
//                       Update User
//                     </button>
//                   </li>
//                   <li>
//                     <button class="dropdown-item delete-user-btn" data-id="${
//                       data._id
//                     }" style="color: red;">
//                       Delete User
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </td>
//           </tr>
//         `);
//       });

//       $("#btnPrevUser").prop("disabled", page === 1);
//       $("#btnNextUser").prop("disabled", !hasNextPage);
//     },
//     error: function (error) {
//       console.error("Error fetching user kindred:", error);
//     },
//   });
// }

// // Handle Delete User
// function handleDelete(userId) {
//   Swal.fire({
//     title: "Are you sure?",
//     text: "This action cannot be undone!",
//     // icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",
//     cancelButtonColor: "#3085d6",
//     confirmButtonText: "Yes, delete it!",
//   }).then((result) => {
//     if (result.value === true) {
//       $.ajax({
//         url: `${BACKEND_URL}/kindred/${userId}`,
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         success: function () {
//           Swal.fire("Deleted!", "User has been deleted.", "success");
//           fetchUserKindred(currentPageUser);
//         },
//         error: function (error) {
//           Swal.fire("Error!", "Failed to delete user.", "error");
//           console.error("Error deleting request:", error);
//         },
//       });
//     }
//   });
// }

// // Handle Update User
// function handleUpdate(userData) {
//   Swal.fire({
//     title: "Update User",
//     html: `
//       <input id="updateMiddlename" class="swal2-input" placeholder="Email" value=${userData.email}>
//       <input id="updatePhone" class="swal2-input" placeholder="Phone" value="${userData.phone}">
//       <input id="updateAddress" class="swal2-input" placeholder="Address" value="${userData.address}">
//       <input id="updateKindred" class="swal2-input" placeholder="Kindred" value="${userData.kindred}">
//     `,
//     showCancelButton: true,
//     confirmButtonText: "Update",
//     preConfirm: () => {
//       return {
//         middlename: $("#updateMiddlename").val().trim(),
//         phone: $("#updatePhone").val().trim(),
//         address: $("#updateAddress").val().trim(),
//         kindred: $("#updateKindred").val().trim(),
//       };
//     },
//   }).then((result) => {
//     if (result.value) {
//       $.ajax({
//         url: `${BACKEND_URL}/kindred/${userData._id}`,
//         method: "PUT",
//         contentType: "application/json",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         data: JSON.stringify(result.value),
//         success: function () {
//           Swal.fire(
//             "Updated!",
//             "User details updated successfully.",
//             "success"
//           );
//           fetchUserKindred(currentPageUser);
//         },
//         error: function (error) {
//           Swal.fire("Error!", "Failed to update user.", "error");
//           console.error("Error updating user:", error);
//         },
//       });
//     }
//   });
// }

// function fetchKindredAll(page = 1, pageSize = 100) {
//   $.ajax({
//     url: `${BACKEND_URL}/kindred?page=${page}&limit=${pageSize}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (response) {
//       if (response && response.data && response.data.length) {
//         const kindredSelect = $("#kindred");
//         kindredSelect.empty(); // Clear existing options
//         kindredSelect.append('<option value="">Select Kindred</option>'); // Default option

//         response.data.forEach(function (kindred) {
//           kindredSelect.append(
//             `<option value="${kindred.kindred}">${kindred.kindred}</option>`
//           );
//         });
//       } else {
//         console.warn("No kindred found in response.");
//       }
//     },
//     error: function (error) {
//       console.error("Error fetching all kindred:", error);
//     },
//   });
// }

// $(document).ready(function () {
//   fetchKindredAll();
// });

// // Event Delegation for Delete & Update Buttons
// $(document).on("click", ".delete-user-btn", function () {
//   const userId = $(this).data("id");
//   handleDelete(userId);
// });

// $(document).on("click", ".update-user-btn", function () {
//   const userData = $(this).data("info");
//   handleUpdate(userData);
// });

// $(document).ready(function () {
//   // Initial data load
//   fetchAllKindred(currentPageAll);
//   fetchUserKindred(currentPageUser);

//   // Pagination handlers for All Kindred
//   $("#btnPrevAll").click(function () {
//     if (currentPageAll > 1) {
//       currentPageAll--;
//       fetchAllKindred(currentPageAll);
//     }
//   });

//   $("#btnNextAll").click(function () {
//     currentPageAll++;
//     fetchAllKindred(currentPageAll);
//   });

//   // Pagination handlers for User Kindred
//   $("#btnPrevUser").click(function () {
//     if (currentPageUser > 1) {
//       currentPageUser--;
//       fetchUserKindred(currentPageUser);
//     }
//   });

//   $("#btnNextUser").click(function () {
//     currentPageUser++;
//     fetchUserKindred(currentPageUser);
//   });

//   // // Handle form submission
//   $(document).ready(function () {
//     $("#kindredForm").on("submit", function (e) {
//       e.preventDefault();

//       // Collect form data
//       const formData = {
//         fullname: $("#fullname").val().trim(),
//         phone: $("#phone").val().trim(),
//         lga: $("#lga").val().trim(),
//         address: $("#address").val().trim(),
//         kindred: $("#kindred").val().trim(),
//         userId: user?.id, // Ensure user is defined
//       };

//       // Validate form inputs
//       for (const field in formData) {
//         if (!formData[field]) {
//           Swal.fire("Oops...", `Please fill in the ${field} field`, "error");
//           return;
//         }
//       }

//       // Ensure token is available
//       if (!token) {
//         Swal.fire("Unauthorized", "User authentication required!", "error");
//         return;
//       }

//       // Disable submit button to prevent duplicate submissions
//       const $submitButton = $("#kindredForm button[type='submit']");
//       $submitButton.prop("disabled", true).text("Processing...");

//       $.ajax({
//         type: "POST",
//         url: `${BACKEND_URL}/kindred/create`,
//         contentType: "application/json",
//         headers: { Authorization: `Bearer ${token}` },
//         data: JSON.stringify(formData),
//         success: function (response) {
//           Swal.fire(
//             "Success!",
//             response.message || "Kindred successfully created!",
//             "success"
//           );

//           // Reset the form
//           $("#kindredForm")[0].reset();

//           // Refresh tables
//           fetchAllKindred(currentPageAll);
//           fetchUserKindred(currentPageUser);
//         },
//         error: function (xhr) {
//           const errorMessage =
//             xhr.responseJSON?.message || "Kindred registration failed";
//           Swal.fire("Oops...", errorMessage, "error");
//         },
//         complete: function () {
//           // Re-enable the submit button
//           $submitButton.prop("disabled", false).text("Submit");
//         },
//       });
//     });
//   });
// });

// // Function to filter users and match LGAs for certificate requests
// function filterAndMatchLGAs() {
//   // First, fetch all users to get support admins
//   $.ajax({
//     url: `${BACKEND_URL}/users`,
//     method: "GET",
//     headers: { Authorization: `Bearer ${token}` },
//     success: function (usersResponse) {
//       // Filter support admins and get their LGAs
//       const supportAdmins = usersResponse.data.filter(
//         (user) => user.role === "support_admin"
//       );
//       const supportAdminLGAs = [
//         ...new Set(supportAdmins.map((admin) => admin.lgaOfOrigin)),
//       ];

//       // Now fetch certificate requests
//       $.ajax({
//         url: `${BACKEND_URL}/indigene/certificate/request?status=Pending`,
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//         success: function (certificateResponse) {
//           console.log("certificateResponse", certificateResponse);
//           // Filter requests where LGA matches support admin LGAs
//           const matchingRequests = certificateResponse.data.filter((request) =>
//             supportAdminLGAs.includes(request.lgaOfOrigin)
//           );

//           // Create a table with the matching requests
//           createLGAMatchTable(supportAdminLGAs, matchingRequests);
//         },
//         error: function (error) {
//           console.error("Error fetching certificate requests:", error);
//         },
//       });
//     },
//     error: function (error) {
//       console.error("Error fetching users:", error);
//     },
//   });
// }

// Function to create the LGA match table
// function createLGAMatchTable(supportAdminLGAs, matchingRequests) {
//   const tableBody = $("#lga-match-table");
//   tableBody.empty();

//   // Add support admin LGAs section
//   tableBody.append(`
//     <tr class="table-info">
//       <td colspan="5"><strong>Support Admin LGAs</strong></td>
//     </tr>
//   `);

//   supportAdminLGAs.forEach((lga) => {
//     tableBody.append(`
//       <tr>
//         <td>${lga}</td>
//         <td></td>
//         <td></td>
//         <td></td>
//         <td></td>

//       </tr>
//     `);
//   });

//   // Add matching requests section
//   tableBody.append(`
//     <tr class="table-info">
//       <td colspan="5"><strong>Matching Certificate Requests</strong></td>
//     </tr>
//   `);

//   if (matchingRequests.length === 0) {
//     tableBody.append(`
//       <tr>
//         <td colspan="5">No matching requests found</td>
//       </tr>
//     `);
//   } else {
//     matchingRequests.forEach((request, index) => {
//       tableBody.append(`
//         <tr>
//           <td>${request.lgaOfOrigin}</td>
//           <td>${request.firstname} ${request.lastname}</td>
//           <td>${request.email}</td>
//           <td>${request.phone}</td>
//           <td>${request.kindred}</td>

//         </tr>
//       `);
//     });
//   }
// }

// // Call this function when needed, for example when a button is clicked
// $(document).on("click", "#filter-lga-btn", function () {
//   filterAndMatchLGAs();
// });

// function filterAndMatchKindredHeadLGAs() {
//   // First, fetch all users to get support admins
//   $.ajax({
//     url: `${BACKEND_URL}/users`,
//     method: "GET",
//     headers: { Authorization: `Bearer ${token}` },
//     success: function (usersResponse) {
//       // Filter support admins and get their LGAs
//       const kindredHead = usersResponse.data.filter(
//         (user) => user.role === "kindred_head"
//       );
//       const kindredHeadLGAs = [
//         ...new Set(kindredHead.map((admin) => admin.lgaOfOrigin)),
//       ];

//       // Now fetch certificate requests
//       $.ajax({
//         url: `${BACKEND_URL}/indigene/certificate/request?status=Pending`,
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//         success: function (certificateResponse) {
//           // Filter requests where LGA matches support admin LGAs
//           const matchingRequests = certificateResponse.data.filter((request) =>
//             kindredHeadLGAs.includes(request.lgaOfOrigin)
//           );

//           $("#card-request-count").text(matchingRequests.length);
//           // Create a table with the matching requests
//           createKindredGroupedTable(kindredHeadLGAs, matchingRequests);
//         },
//         error: function (error) {
//           console.error("Error fetching certificate requests:", error);
//         },
//       });
//     },
//     error: function (error) {
//       console.error("Error fetching users:", error);
//     },
//   });
// }

// // Create table grouped by kindred
// function createKindredGroupedTable(kindredHeadLGAs, matchingRequests) {
//   const tableBody = $("#kindred-match-table");
//   tableBody.empty();

//   // Add support admin LGAs section
//   tableBody.append(`
//     <tr class="table-info">
//       <td colspan="6"><strong>Kindred Head LGAs</strong></td>
//     </tr>
//   `);

//   kindredHeadLGAs.forEach((lga) => {
//     tableBody.append(`
//       <tr>
//         <td>${lga}</td>
//         <td></td>
//         <td></td>
//         <td></td>
//         <td></td>
//         <td></td>
//       </tr>
//     `);
//   });

//   // Add matching requests section
//   tableBody.append(`
//     <tr class="table-info">
//       <td colspan="6"><strong>Matching Certificate Requests</strong></td>
//     </tr>
//   `);

//   if (matchingRequests.length === 0) {
//     tableBody.append(`
//       <tr>
//       <td colspan="6">No matching requests found</td>
//       </tr>
//       `);
//   } else {
//     matchingRequests.forEach((request, index) => {
//       const isRejected = request.status === "Rejected";
//       const isVerified = request.isVerified === true;

//       tableBody.append(`
//         <tr>
//           <td>${request.lgaOfOrigin}</td>
//           <td>${request.firstname} ${request.lastname}</td>
//           <td>${request.phone}</td>
//           <td>${request.isVerified}</td>
//           <td>${request.kindred}</td>

//           <td>
//             <div class="dropdown">
//               <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
//                 <i class="fas fa-ellipsis-v"></i>
//               </button>
//               <ul class="dropdown-menu">
//                 <li><button class="dropdown-item btn-cert-verify" data-id="${
//                   request._id
//                 }"
//                 ${
//                   isVerified ? "disabled" : ""
//                 }  style="color: green;">Verity Request</button></li>
//                 <li><button class="dropdown-item btn-cert-reject" data-id="${
//                   request._id
//                 }" ${
//         isRejected ? "disabled" : ""
//       } style="color: red;">Reject</button></li>
//                 <li><button class="dropdown-item btn-cert-view" data-id="${
//                   request._id
//                 }" style="color: blue;">View</button></li>
//               </ul>
//             </div>
//           </td>

//         </tr>
//       `);
//     });
//   }
// }

// $(document).ready(function () {
//   filterAndMatchKindredHeadLGAs();
// });

// // Trigger on button click
// $(document).on("click", "#filter-kindred-btn", function () {
//   filterAndMatchKindredHeadLGAs();
// });

// // Id Card
// $(document).ready(function () {
//   const pageSize = 10;
//   let currentPage = 1;
//   let rejectionId = null;

//   const apiHeaders = {
//     Authorization: `Bearer ${token}`,
//   };

//   const tableBody = $("#view-all-card-table");

//   function updatePaginationButtons(hasNextPage) {
//     $("#btn-prev").prop("disabled", currentPage === 1);
//     $("#btn-next").prop("disabled", !hasNextPage);
//   }

//   function updateRequestCount(count) {
//     $("#request").text(count);
//   }

//   function renderTable(data) {
//     tableBody.empty();
//     data.forEach((item, index) => {
//       const statusBadge = {
//         Approved: `<span class="badge rounded-pill bg-success">Approved</span>`,
//         Pending: `<span class="badge rounded-pill bg-warning text-dark">Pending</span>`,
//         Rejected: `<span class="badge rounded-pill bg-danger">Rejected</span>`,
//       };

//       tableBody.append(`
//         <tr data-id="${item._id}">
//           <td>${(currentPage - 1) * pageSize + index + 1}</td>
//           <td>${item.firstname} ${item.lastname}</td>
//           <td>${item.phone}</td>
//           <td>${item.email}</td>
//            <td>${statusBadge[item.status] || item.status}</td>
//           <td>
//             <button class="btn btn-sm btn-success btn-approve" data-id="${
//               item._id
//             }" title="Approve">
//               <i class="fas fa-check"></i>
//             </button>
//             <button class="btn btn-sm btn-warning btn-view" data-id="${
//               item._id
//             }" title="View">
//               <i class="fas fa-eye"></i>
//             </button>
//             <button class="btn btn-sm btn-danger btn-reject" data-id="${
//               item._id
//             }" title="Reject" ${item.status === "Rejected" ? "disabled" : ""}>
//               <i class="fas fa-times"></i>
//             </button>
//           </td>
//         </tr>
//       `);
//     });
//   }

//   function fetchData(page) {
//     $.ajax({
//       url: `${BACKEND_URL}/idcard/card-request?page=${page}&limit=${pageSize}&statuses=Pending,Rejected`,
//       method: "GET",
//       headers: apiHeaders,
//       success: function (response) {
//         const { data, hasNextPage } = response;
//         $("#id-request").text(data.length);
//         renderTable(data);
//         updatePaginationButtons(hasNextPage);
//         updateRequestCount(data.length);

//         let pendingCount = 0;
//         let rejectedCount = 0;

//         data.forEach((element) => {
//           if (element.status === "Pending") {
//             pendingCount++;
//           }
//           if (element.status === "Rejected") {
//             rejectedCount++;
//           }
//         });

//         $("#pending").text(pendingCount);
//         $("#rejected").text(rejectedCount);
//       },
//       error: function (error) {
//         console.error("Error fetching data:", error);
//       },
//     });
//   }

//   // Handle card Approval
//   function handleApproval(requestId) {
//     $.ajax({
//       url: `${BACKEND_URL}/idcard/${requestId}/approve`,
//       method: "PATCH",
//       headers: apiHeaders,
//       success: function () {
//         showNotification("success", "Card approved successfully.");
//         fetchData(currentPage);
//       },
//       error: function (error) {
//         console.error("Error approving request:", error);
//       },
//     });
//   }

//   // Handle card rejection
//   function handleIDRejection(rejectionReason) {
//     if (!rejectionReason) {
//       alert("Please provide a reason for rejection.");
//       return;
//     }

//     $.ajax({
//       url: `${BACKEND_URL}/idcard/${rejectionId}/reject`,
//       method: "PATCH",
//       contentType: "application/json",
//       data: JSON.stringify({ rejectionReason }),
//       headers: apiHeaders,
//       success: function () {
//         $("#rejectionModal").modal("hide");
//         $("#idRejectionReason").val("");
//         showNotification("success", "Request rejected successfully.");

//         fetchData(currentPage);
//       },
//       error: function (error) {
//         console.error("Error rejecting request:", error);
//         showNotification(
//           "danger",
//           xhr.responseJSON?.message || "Error occurred."
//         );
//       },
//     });
//   }

//   // Handle View Modal Function
function handleCardView(requestId) {
  const apiHeaders = {
    Authorization: `Bearer ${token}`,
  };
  $.ajax({
    url: `${BACKEND_URL}/idcard/${requestId}/request`,
    method: "GET",
    headers: apiHeaders,
    success: function (response) {
      const docTypes = ["utilityBill", "ref_letter"];
      const documentTitles = ["Utility Bill", "Reference Letter"];

      // Filter documents that actually exist in response
      const validDocuments = docTypes
        .map((key, index) => ({ key, title: documentTitles[index] }))
        .filter((doc) => response[doc.key]); // Check if document exists

      let modalContent = `
              <div class="container-fluid">
                  <div class="row mb-3">
                      <div class="col-md-3 text-center">
                          <img 
                            src="${
                              response.passportPhoto ||
                              "/assets/images/avatar.jpeg"
                            }" 
                            alt="Passport Photo" 
                            class="img-fluid rounded shadow-sm profile-photo"
                            style="max-height: 150px;"
                            crossOrigin="anonymous"
                          >
                      </div>
                      <div class="col-md-9">
                          <h5 class="fw-bold mb-2">${response.firstname} ${
        response.lastname
      }</h5>
                          <p class="mb-1"><strong>Phone:</strong> ${
                            response.phone
                          }</p>
                          <p class="mb-1"><strong>Email:</strong> ${
                            response.email
                          }</p>
                          <p class="mb-1"><strong>Status:</strong> <span class="badge bg-info">${
                            response.status
                          }</span></p>
                          <p><strong>State:</strong> ${
                            response.userId?.stateOfOrigin
                          }</p>
                          <p><strong>LGA:</strong> 
                          ${response.userId?.lgaOfOrigin}
                          </p>
                          <p><strong>isProfileCompleted:</strong> ${
                            response.userId?.isProfileCompleted
                          }</p>
                      </div>
                  </div>

                  <hr class="my-3">
                  <h6 class="text-primary">Uploaded Documents</h6>
          `;

      if (validDocuments.length === 0) {
        modalContent += `<p class="text-muted">No documents uploaded.</p>`;
      }

      // Generate HTML for each existing document
      validDocuments.forEach((doc, index) => {
        const fileUrl = `${BACKEND_URL}/idcard/${requestId}/document/${doc.key}`;

        modalContent += `
                  <div class="card my-3 shadow-sm">
                      <div class="card-header bg-light fw-semibold">
                          ${doc.title}
                      </div>
                      <div class="card-body">
                          <div id="pdf-viewer-container-${index}" style="width:100%; height:400px;" class="pdf-container"></div>
                          <div class="text-end mt-2">
                             <button class="btn btn-sm btn-outline-primary me-2" onclick="window.open('${fileUrl}', '_blank')">Open in New Tab</button>
                             <button class="btn btn-sm btn-outline-secondary" data-doc-index="${index}" data-url="${fileUrl}" onclick="downloadPDF(this)">Download</button>
                          </div>
                      </div>
                  </div>
              `;
      });

      modalContent += `</div>`;
      $("#viewModal .modal-body").html(modalContent);
      $("#viewModal").modal("show");

      // Load PDFs with authorization
      validDocuments.forEach((doc, index) => {
        const fileUrl = `${BACKEND_URL}/idcard/${requestId}/document/${doc.key}`;
        const container = document.getElementById(
          `pdf-viewer-container-${index}`
        );
        // Show loader while fetching
        $(`#pdf-viewer-container-${index}`).html(`
                  <div class="d-flex justify-content-center align-items-center h-100">
                      <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                      </div>
                  </div>
              `);

        // Fetch document with authorization
        fetch(fileUrl, {
          headers: {
            Authorization: apiHeaders.Authorization,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch document");

            // --- KEY LOGIC: Get the content type from the response header ---
            const contentType = res.headers.get("Content-Type");

            // Return both the blob and the content type for the next .then()
            return res.blob().then((blob) => ({ blob, contentType }));
          })
          .then(({ blob, contentType }) => {
            const blobUrl = URL.createObjectURL(blob);

            // --- Check the content type and call the correct renderer ---
            if (contentType === "application/pdf") {
              loadPDFJ(blobUrl, container);
            } else if (contentType && contentType.startsWith("image/")) {
              loadImage(blobUrl, container);
            } else {
              // Handle unknown or missing content type
              throw new Error(
                `Unsupported file type: ${contentType || "Unknown"}`
              );
            }
          })
          .catch((err) => {
            console.error(`Error loading PDF [${doc.key}]:`, err);
            $(`#pdf-viewer-container-${index}`).html(`
                      <div class="alert alert-danger">
                          Failed to load document: ${err.message}
                          <div class="mt-2">
                              <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary">Open in New Tab</a>
                          </div>
                      </div>
                  `);
          });
      });
    },
    error: function (error) {
      console.error("Error fetching request details:", error);
      alert("Failed to fetch request details.");
    },
  });
}
$("#idcardsTable").on("click", ".btn-view", function () {
  const requestId = $(this).data("id");

  handleCardView(requestId);
});

//   function showNotification(type, message) {
//     const toastHtml = `
//             <div class="toast align-items-center text-white bg-${type} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
//               <div class="d-flex">
//                 <div class="toast-body">${message}</div>
//                 <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
//               </div>
//             </div>`;
//     $("#toast-container").append(toastHtml);
//     const toastEl = $("#toast-container .toast:last")[0];
//     // new bootstrap.Toast(toastEl, { delay: 60000 }).show();
//     new bootstrap.Toast(toastEl, { autohide: false }).show();
//   }

//   $(document).on("click", ".btn-approve", function () {
//     const requestId = $(this).data("id");
//     handleApproval(requestId);
//   });

//   $(document).on("click", ".btn-reject", function () {
//     rejectionId = $(this).data("id");
//     $("#rejectionModal").modal("show");
//   });

//   $("#submitIDRejection").click(function () {
//     const reason = $("#idRejectionReason").val();
//     handleIDRejection(reason);
//   });

//   $("#btn-prev").click(function () {
//     if (currentPage > 1) {
//       currentPage--;
//       fetchData(currentPage);
//     }
//   });

//   $("#btn-next").click(function () {
//     currentPage++;
//     fetchData(currentPage);
//   });

//   // Initial data load
//   fetchData(currentPage);
// });
// $(document).ready(function () {
//   // Add hover effects to cards
//   $(".stat-card").hover(
//     function () {
//       $(this).addClass("shadow");
//     },
//     function () {
//       $(this).removeClass("shadow");
//     }
//   );

//   // Add click effect to quick action buttons
//   $(".quick-action-btn").click(function () {
//     $(this).addClass("active");
//     setTimeout(() => {
//       $(this).removeClass("active");
//     }, 200);
//   });
// });

// // ✅ Active Page Highlight Script
// $(document).ready(function () {
//   const currentPage = window.location.pathname.split("/").pop(); // e.g., profile.html
//   $("#sidebar-links .nav-link").each(function () {
//     const linkPage = $(this).attr("href");
//     if (linkPage === currentPage) {
//       $(this).addClass("active");
//     }
//   });
// });

// //Fetch kindred by userId
// function fetchAllLga(page) {
//   $.ajax({
//     url: `${BACKEND_URL}/lgas?page=${page}&limit=${pageSize}`,
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     success: function (response) {
//       const { data, hasNextPage } = response;
//       const tableBody = $("#lga-table");
//       tableBody.empty();

//       data.forEach((data, index) => {
//         tableBody.append(`
//           <tr>
//             <td>${(page - 1) * pageSize + index + 1}</td>
//             <td>${data.name}
//             <td>${data.headquaters}</td>

//             <td>
//               <div class="dropdown">
//                 <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
//                   <i class="fas fa-ellipsis-v"></i>
//                 </button>
//                 <ul class="dropdown-menu">
//                   <li>
//                     <button class="dropdown-item update-lga-btn" data-id="${
//                       data._id
//                     }" data-info='${JSON.stringify(data)}'>
//                       Update User
//                     </button>
//                   </li>
//                   <li>
//                     <button class="dropdown-item delete-lga-btn" data-id="${
//                       data._id
//                     }" style="color: red;">
//                       Delete User
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//             </td>
//           </tr>
//         `);
//       });

//       $("#btnPrevUser").prop("disabled", page === 1);
//       $("#btnNextUser").prop("disabled", !hasNextPage);
//     },
//     error: function (error) {
//       console.error("Error fetching user kindred:", error);
//     },
//   });
// }
// $(document).ready(function () {
//   fetchAllLga(currentPageAll);
// });

// // Handle Delete User
// function handleDeleteLga(userId) {
//   Swal.fire({
//     title: "Are you sure?",
//     text: "This action cannot be undone!",
//     // icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",
//     cancelButtonColor: "#3085d6",
//     confirmButtonText: "Yes, delete it!",
//   }).then((result) => {
//     if (result.value === true) {
//       $.ajax({
//         url: `${BACKEND_URL}/lgas/${userId}`,
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         success: function () {
//           Swal.fire("Deleted!", "User has been deleted.", "success");
//           fetchAllLga(currentPageUser);
//         },
//         error: function (xhr) {
//           const errorMessage =
//             xhr.responseJSON?.message || "Failed to delete LGA.";
//           Swal.fire("Error!", errorMessage, "error");
//         },
//       });
//     }
//   });
// }

// // Handle Update User
// function handleUpdateLga(userData) {
//   Swal.fire({
//     title: "Update User",
//     html: `
//        <select id="updateName" name="lga"  class="swal2-input">
//             <option value="${userData.name}">${userData.name}</option>
//             <option value="Agatu">Agatu</option>
//             <option value="Apa">Apa</option>
//             <option value="Ado">Ado</option>
//             <option value="Buruku">Buruku</option>
//             <option value="Gboko">Gboko</option>
//             <option value="Guma">Guma</option>
//             <option value="Gwer East">Gwer East</option>
//             <option value="Gwer West">Gwer West</option>
//             <option value="Katsina-Ala">Katsina-Ala</option>
//             <option value="Konshisha">Konshisha</option>
//             <option value="Kwande">Kwande</option>
//             <option value="Logo">Logo</option>
//             <option value="Makurdi">Makurdi</option>
//             <option value="Obi">Obi</option>
//             <option value="Ogbadibo">Ogbadibo</option>
//             <option value="Ohimini">Ohimini</option>
//             <option value="Oju">Oju</option>
//             <option value="Okpokwu">Okpokwu</option>
//             <option value="Oturkpo">Oturkpo</option>
//             <option value="Tarka">Tarka</option>
//             <option value="Ukum">Ukum</option>
//             <option value="Ushongo">Ushongo</option>
//             <option value="Vandeikya">Vandeikya</option>

//         </select>
//       <select id="updateLgaHeadqtrs" class="swal2-input" placeholder="LGA Headquaters">
//               <option value="${userData.headquaters}">${userData.headquaters}</option>
//             <option value="Obagaji">Obagaji</option>
//             <option value="Ugbokpo">Ugbokpo</option>
//             <option value="Igumale">Igumale</option>
//             <option value="Buruku">Buruku</option>
//             <option value="Gboko">Gboko</option>
//             <option value="Gbajimba">Gbajimba</option>
//             <option value="Aliade">Aliade</option>
//             <option value="Naka">Naka</option>
//             <option value="Katsina-Ala">Katsina-Ala</option>
//             <option value="Tse-Agberagba">Tse-Agberagba</option>
//             <option value="Adikpo">Adikpo</option>
//             <option value="Ugba">Ugba</option>
//             <option value="Makurdi">Makurdi</option>
//             <option value="Obarike-Ito">Obarike-Ito</option>
//             <option value="Otukpa">Otukpa</option>
//             <option value="Idekpa">Idekpa</option>
//             <option value="Oju">Oju</option>
//             <option value="Okpoga">Okpoga</option>
//             <option value="Oturkpo">Oturkpo</option>
//             <option value="Wannune">Wannune</option>
//             <option value="Sankera">Sankera</option>
//             <option value="Lessel">Lessel</option>
//             <option value="Vandeikya">Vandeikya</option>

//         </select>
//     `,
//     showCancelButton: true,
//     confirmButtonText: "Update",
//     preConfirm: () => {
//       return {
//         name: $("#updateName").val().trim(),
//         headquaters: $("#updateLgaHeadqtrs").val().trim(),
//       };
//     },
//   }).then((result) => {
//     if (result.value) {
//       $.ajax({
//         url: `${BACKEND_URL}/lgas/${userData._id}`,
//         method: "PATCH",
//         contentType: "application/json",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         data: JSON.stringify(result.value),
//         success: function () {
//           Swal.fire(
//             "Updated!",
//             "User details updated successfully.",
//             "success"
//           );
//           fetchAllLga(currentPageUser);
//         },
//         error: function (error) {
//           Swal.fire("Error!", "Failed to update user.", "error");
//           console.error("Error updating user:", error);
//         },
//       });
//     }
//   });
// }

// // Event Delegation for Delete & Update Buttons
// $(document).on("click", ".delete-lga-btn", function () {
//   const userId = $(this).data("id");
//   handleDeleteLga(userId);
// });

// $(document).on("click", ".update-lga-btn", function () {
//   const userData = $(this).data("info");
//   handleUpdateLga(userData);
// });
