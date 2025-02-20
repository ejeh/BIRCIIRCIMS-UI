// const BACKEND_URL = "http://localhost:5000/api";
const BACKEND_URL = "https://bscr-mis-ui.onrender.com/api";

let userData = localStorage.getItem("token");
userData = JSON.parse(userData);
const { token, user } = userData;

$(document).ready(function () {
  // Assume the user role is dynamically fetched from your backend
  const userRole = user.role; // Replace with actual user role fetching logic

  // Hide all menus initially
  $(".super-admin-menu, .support-admin-menu, .user-menu").hide();

  // Show menus based on role
  if (userRole === "super_admin") {
    $(".super-admin-menu").show();
    $(".dashboard_bar").text("Admin Panel");
  } else if (userRole === "support_admin") {
    $(".support-admin-menu").show();
    $('.super-admin-menu:has(a[href="approvals.html"])').show();
    $(".dashboard_bar").text("Admin Panel");
  } else if (userRole === "user") {
    $(".user-menu").show();
    $(".dashboard_bar").text("Dashboard");
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
      console.log(data.identification);
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

        // Refresh the select picker (if using Bootstrap Select)
        $(".selectpicker").selectpicker("refresh");
      }

      // Set the value in the select field
      $("#maritalStatus").val(data.maritalStatus).change();
      $("#gender").val(data.gender).change();
      $("#stateOfOrigin").val(data.stateOfOrigin).change();
      $("#lgaOfOrigin").val(data.lgaOfOrigin).change();
      $("#stateOfResidence").val(data.stateOfResidence).change();
      $("#lgaOfResidence").val(data.lgaOfResidence).change();
      $("#countryOfResidence").val(data.countryOfResidence).change();
      $("#identification").val(data.identification);
      $("#religion").val(data.religion).change();

      $(".selectpicker").selectpicker("refresh");

      // ------------------------------
      // Prepopulate Educational History
      // ------------------------------
      if (data.educationalHistory) {
        // Populate Primary School
        if (data.educationalHistory.primarySchool) {
          setInputValue(
            "primarySchool_name",
            data.educationalHistory.primarySchool.name
          );
          setInputValue(
            "primarySchool_address",
            data.educationalHistory.primarySchool.address
          );
          setInputValue(
            "primarySchool_yearOfAttendance",
            data.educationalHistory.primarySchool.yearOfAttendance
          );
        }

        // Populate Secondary School
        if (data.educationalHistory.secondarySchool) {
          setInputValue(
            "secondarySchool_name",
            data.educationalHistory.secondarySchool.name
          );
          setInputValue(
            "secondarySchool_address",
            data.educationalHistory.secondarySchool.address
          );
          setInputValue(
            "secondarySchool_yearOfAttendance",
            data.educationalHistory.secondarySchool.yearOfAttendance
          );
        }

        // Populate Tertiary Institutions (assumes one or more institutions)
        if (
          data.educationalHistory &&
          data.educationalHistory.tertiaryInstitutions
        ) {
          data.educationalHistory.tertiaryInstitutions.forEach(function (
            tertiary,
            index
          ) {
            // Use the name attribute to target each input.
            $(
              'input[name="educationalHistory.tertiaryInstitutions[' +
                index +
                '].name"]'
            ).val(tertiary.name);
            $(
              'input[name="educationalHistory.tertiaryInstitutions[' +
                index +
                '].address"]'
            ).val(tertiary.address);
            $(
              'input[name="educationalHistory.tertiaryInstitutions[' +
                index +
                '].certificateObtained"]'
            ).val(tertiary.certificateObtained);
            $(
              'input[name="educationalHistory.tertiaryInstitutions[' +
                index +
                '].matricNo"]'
            ).val(tertiary.matricNo);
            $(
              'input[name="educationalHistory.tertiaryInstitutions[' +
                index +
                '].yearOfAttendance"]'
            ).val(tertiary.yearOfAttendance);
          });
        }
      }

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
        family = [],
        neighbor = [],
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
        other_identification,
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

      // Populate neighbors' details
      // Iterate over the neighbor array and populate the input fields
      $(".neighbor-fields").each(function (index) {
        if (neighbor[index]) {
          $(this)
            .find('input[name="neighbor_name[]"]')
            .val(neighbor[index].name);
          $(this)
            .find('input[name="neighbor_address[]"]')
            .val(neighbor[index].address);
          $(this)
            .find('input[name="neighbor_phone[]"]')
            .val(neighbor[index].phone);
        }
      });

      // Populate family' details
      // Iterate over the family array and populate the input fields
      $(".family-fields").each(function (index) {
        if (family[index]) {
          $(this).find('input[name="family_name[]"]').val(family[index].name);
          $(this)
            .find('input[name="family_address[]"]')
            .val(family[index].address);
          $(this).find('input[name="family_phone[]"]').val(family[index].phone);
          $(this)
            .find('input[name="family_relationship[]"]')
            .val(family[index].relationship);
        }
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

$(document).ready(function () {
  // Hold state for counts and the auto-save timer.
  const state = {
    autoSaveTimer: null,
    institutionCount: 0,
    neighborCount: 0,
    familyCount: 0,
    employmentCount: 0,
  };

  // Utility function to set input values
  const setInputValue = (id, value) => {
    const element = document.getElementById(id);
    if (element) element.value = value || "";
  };

  /* ===================================================
   * Field Addition Functions
   * =================================================== */

  // Add a new tertiary institution section.
  const addInstitution = (institutionData = {}) => {
    const container = $("#tertiary-institution-container");
    // Calculate the index from the number of current institutions.
    const index = container.find(".institution-fields").length;

    const newInstitutionFields = `
    <div class="institution-fields m-b30">
      <label class="form-label">Tertiary Institution ${index + 1}</label>
      <input
        type="text"
        class="form-control"
        name="educationalHistory.tertiaryInstitutions[${index}].name"
        placeholder="Name of Tertiary Institution"
        value="${institutionData.name || ""}"
        required
      />
      <input
        type="text"
        class="form-control"
        name="educationalHistory.tertiaryInstitutions[${index}].address"
        placeholder="Address of Tertiary Institution"
        value="${institutionData.address || ""}"
        required
      />
      <input
        type="text"
        class="form-control"
        name="educationalHistory.tertiaryInstitutions[${index}].certificateObtained"
        placeholder="Certificate Obtained"
        value="${institutionData.certificateObtained || ""}"
        required
      />
      <input
        type="text"
        class="form-control"
        name="educationalHistory.tertiaryInstitutions[${index}].matricNo"
        placeholder="Matriculation Number"
        value="${institutionData.matricNo || ""}"
        required
      />
      <input
        type="text"
        class="form-control"
        name="educationalHistory.tertiaryInstitutions[${index}].yearOfAttendance"
        placeholder="Year of Attendance"
        value="${institutionData.yearOfAttendance || ""}"
        required
      />
    </div>`;
    container.append(newInstitutionFields);
    state.institutionCount++;

    // Validate the newly added fields before auto-saving
    validateAndAutoSaveIntitution(container, index);
  };

  // Function to validate the newly added institution fields and trigger auto-save if valid
  const validateAndAutoSaveIntitution = (container, index) => {
    const fields = container
      .find(`.institution-fields:nth-child(${index + 1})`)
      .find("input");
    let isValid = true;

    fields.each(function () {
      if (!$(this).val().trim()) {
        isValid = false;
        return false; // Exit the loop early if any field is empty
      }
    });

    if (isValid) {
      autoSave();
    } else {
      console.log("Please fill out all required fields before saving.");
    }
  };

  // Add a new family section.
  const addFamily = (familyData = {}) => {
    const container = $("#family-container");
    // Calculate the index from the number of current institutions.
    const index = container.find(".family-fields").length;

    const newFamilyFields = `
    <div class="family-fields m-b30">
      <label class="form-label">Family ${index + 1}</label>
      <input 
        type="text" 
        class="form-control m-b10 family-name" 
        name="family_name[]" 
        placeholder="Full Name" 
        value="${familyData.name || ""}"
        required />

      <input
        type="text" 
        class="form-control m-b10 family-relationship" 
        name="family_relationship[]" 
        placeholder="Relationship" 
        value="${familyData.relationship || ""}"
        required />

      <input 
        type="tel" 
        class="form-control family-phone" 
        name="family_phone[]" 
        placeholder="Phone Number" 
        value="${familyData.phone || ""}"
        required />

      <input 
        type="text" 
        class="form-control family-address" 
        name="family_address[]" 
        placeholder="Residential Address" 
        value="${familyData.address || ""}"
        required />
    </div>`;

    container.append(newFamilyFields);
    state.familyCount++;

    if (state.familyCount === 5) {
      $("#add-family")
        .prop("disabled", true)
        .text("Maximum family reached")
        .removeClass("btn-primary")
        .addClass("btn-secondary");
    }

    // Trigger auto-save after adding new fields
    autoSaveFamily();
  };

  // Existing auto-save function (modified to validate family data)
  const autoSaveFamily = () => {
    // Validate family data before saving
    if (validateFamilyData()) {
      console.log("All family fields are valid. Proceeding with auto-save...");
      autoSave();
    } else {
      console.log("Some family fields are incomplete. Auto-save skipped.");
    }
  };

  // Helper function to validate family data
  const validateFamilyData = () => {
    const familyContainer = $("#family-container");
    const familyFields = familyContainer.find(".family-fields");
    let allFieldsValid = true;

    familyFields.each((index, field) => {
      const name = $(field).find(".family-name").val().trim();
      const relationship = $(field).find(".family-relationship").val().trim();
      const phone = $(field).find(".family-phone").val().trim();
      const address = $(field).find(".family-address").val().trim();

      if (!name || !relationship || !phone || !address) {
        allFieldsValid = false;
        return false; // Exit the loop early if any field is invalid
      }
    });

    return allFieldsValid;
  };

  // // Add a new neighbor section.
  const addNeighbor = (neighborData = {}) => {
    const container = $("#neighbors-container");
    const index = container.find(".neighbor-fields").length;

    const newNeighborFields = `
      <div class="neighbor-fields m-b30">
        <label class="form-label">Neighbor ${index + 1}</label>
        <input 
          type="text" 
          class="form-control m-b10 neighbor-name" 
          name="neighbor_name[]" 
          placeholder="Full Name" 
          value="${neighborData.name || ""}"
          required />
  
        <input 
          type="text" 
          class="form-control m-b10 neighbor-address" 
          name="neighbor_address[]" 
          placeholder="Residential Address" 
          value="${neighborData.address || ""}"
          required />
  
        <input 
          type="tel" 
          class="form-control neighbor-phone" 
          name="neighbor_phone[]" 
          placeholder="Phone Number" 
          value="${neighborData.phone || ""}"
          required />
      </div>`;

    container.append(newNeighborFields);
    state.neighborCount++;

    if (state.neighborCount === 5) {
      $("#add-neighbor")
        .prop("disabled", true)
        .text("Maximum neighbors reached")
        .removeClass("btn-primary")
        .addClass("btn-secondary");
    }

    // Attach event listeners to the new fields for auto-save validation
    const newFields = container.find(".neighbor-fields").last();
    newFields.find("input").on("input", function () {
      validateAndAutoSave(newFields);
    });
  };

  // Function to validate and auto-save only if all fields are filled
  const validateAndAutoSave = (neighborFields) => {
    const name = neighborFields.find(".neighbor-name").val().trim();
    const address = neighborFields.find(".neighbor-address").val().trim();
    const phone = neighborFields.find(".neighbor-phone").val().trim();

    if (name && address && phone) {
      autoSave(); // Trigger auto-save only if all fields are complete
    }
  };

  // Add a new employment section.
  const addEmployment = (employmentData = {}) => {
    const container = $("#employment-history-container");
    // Calculate the index from the number of current employment.
    const index = container.find(".employment-fields").length;
    const newEmploymentFields = `
      <div class="employment-fields m-b30">
        <label class="form-label">Employment ${index + 1}</label> 
        <input
          type="text"
          class="form-control"
          name="companyName[]"
          placeholder="Company Name"
          value="${employmentData.companyName || ""}"
          required
        />
        <input
          type="text"
          class="form-control"
          name="address[]"
          placeholder="Company Address"
          value="${employmentData.address || ""}"
          required
        />
        <input
          type="text"
          class="form-control"  
          name="designation[]"
          placeholder="Designation"
          value="${employmentData.designation || ""}"
          required
          />
          <input
          type="number"
          class="form-control"
          name="startYear[]"
          placeholder="Start Year"
          value="${employmentData.startYear || ""}"
          required
          />
          <div>
          <input
          type="number"
          class="form-control"
          name="endYear[]"
          placeholder="End Year"
          value="${employmentData.endYear || ""}"
          required
          />
           <small class="form-text text-muted">Leave blank if this is your current employment.</small>
          </div>
          
          <div class="form-check">
          <input
          type="checkbox"
          class="form-check-input"
          name="isCurrentEmployment[]"
          value="${employmentData.isCurrentEmployment || ""}"
          />
             <label class="form-check-label"for="isCurrentEmployment">This is my current employment</label>
          </div>
           <div>
            <label for="description">Description of Company</label>
          <textarea
          class="form-control"
          name="description[]"
          placeholder="Job Description"
          value="${employmentData.description || ""}"
          required
          >
          </textarea>
         </div>
      </div>`;
    container.append(newEmploymentFields);
    state.employmentCount++;

    // Validate and auto-save only if all required fields are filled
    validateAndAutoSaveEmployment();
  };

  const validateAndAutoSaveEmployment = () => {
    const container = $("#employment-history-container");
    const employmentFields = container.find(".employment-fields");

    let isComplete = true;

    employmentFields.each(function () {
      const fields = $(this).find("input[required], textarea[required]");
      fields.each(function () {
        if (!$(this).val()) {
          isComplete = false;
          return false; // Exit the loop early if any field is empty
        }
      });

      if (!isComplete) {
        return false; // Exit the outer loop early if any field is empty
      }
    });

    if (isComplete) {
      autoSave();
    }
  };

  /* ===================================================
   * Data Population Logic (Updated)
   * =================================================== */

  const populateTertiaryInstitutions = (institutions) => {
    const container = $("#tertiary-institution-container");
    container.empty(); // Clear existing fields

    if (institutions && institutions.length > 0) {
      institutions.forEach((institution) => addInstitution(institution));
    } else {
      // Add at least one empty institution field
      addInstitution();
    }
  };

  const populateFamily = (family) => {
    const container = $("#family-container");
    container.empty(); // Clear existing fields

    if (family && family.length > 0) {
      family.forEach((fam) => addFamily(fam));
    } else {
      // Add at least one empty family field
      addFamily();
    }
  };

  const populateNeighbors = (neighbors) => {
    const container = $("#neighbors-container");
    container.empty(); // Clear existing fields

    if (neighbors && neighbors.length > 0) {
      neighbors.forEach((neighbor) => addNeighbor(neighbor));
    } else {
      // Add at least one empty family field
      addNeighbor();
    }
  };

  const populateEmploymentHistory = (employments) => {
    const container = $("#employment-history-container");
    container.empty(); // Clear existing fields

    if (employments && employments.length > 0) {
      employments.forEach((employment) => addEmployment(employment));
    } else {
      // Add at least one empty employment field
      addEmployment();
    }
  };

  // Modified AJAX success handler
  const handleProfileDataSuccess = (data) => {
    // ... existing population code for other fields ...

    // Handle educational history
    if (data.educationalHistory) {
      // Primary and secondary school population (keep existing code)

      // Tertiary institutions - use our new method
      populateTertiaryInstitutions(
        data.educationalHistory.tertiaryInstitutions
      );
    }

    // Update institution count state
    state.institutionCount = $(
      "#tertiary-institution-container .institution-fields"
    ).length;

    if (data.family) {
      populateFamily(data.family);
      // ... rest of existing population code ...
    }
    state.familyCount = $("#neighbors-container .neighbor-fields").length;

    if (data.neighbor) {
      populateNeighbors(data.neighbor);
      // ... rest of existing population code ...
    }
    state.neighborCount = $("#neighbors-container .neighbor-fields").length;

    if (data.employmentHistory) {
      populateEmploymentHistory(data.employmentHistory);
      // ... rest of existing population code ...
    }
    state.employmentCount = $(
      "#employment-history-container .employment-fields"
    ).length;
  };

  // Modified AJAX call
  $.ajax({
    url: `${BACKEND_URL}/users/${user.id}`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    success: handleProfileDataSuccess,
    error: function (error) {
      // ... existing error handling ...
    },
  });

  /* ===================================================
   * Data Collection
   * =================================================== */

  const collectFormData = () => {
    // Initialize FormData (this will also capture file uploads)
    const formData = new FormData();

    // List of simple fields by their IDs.
    const fields = [
      "middlename",
      "lastname",
      "nationality",
      "community",
      "religion",
      "gender",
      "stateOfOrigin",
      "DOB",
      "countryOfResidence",
      "lgaOfOrigin",
      "maritalStatus",
      "house_number",
      "street_name",
      "nearest_bus_stop_landmark",
      "city_town",
      "stateOfResidence",
      "lgaOfResidence",
      "id_number",
      "issue_date",
      "expiry_date",
    ];
    fields.forEach((field) => {
      const value = $(`#${field}`).val() || "";
      formData.append(field, value);
    });

    // Handle file upload (e.g. passport photo)
    const passportPhoto = $("#passportPhoto")[0]?.files[0];
    if (passportPhoto) {
      formData.append("passportPhoto", passportPhoto);
    }

    // Build the next-of-kin object.
    const nextOfKin = {
      nok_surname: $("#nok_surname").val().trim(),
      nok_firstname: $("#nok_firstname").val().trim(),
      nok_middlename: $("#nok_middlename").val().trim(),
      nok_relationship: $("#nok_relationship").val().trim(),
      nok_countryOfResidence: $("#nok_countryOfResidence").val().trim(),
      nok_stateOfResidence: $("#nok_stateOfResidence").val().trim(),
      nok_lgaOfResidence: $("#nok_lgaOfResidence").val().trim(),
      nok_cityOfResidence: $("#nok_cityOfResidence").val().trim(),
      nok_address: $("#nok_address").val().trim(),
    };

    // Build the health info object.
    const healthInfo = {
      bloodGroup: $("#bloodGroup").val(),
      genotype: $("#genotype").val(),
      disabilityStatus: $("#disabilityStatus").val(),
    };

    // Build the business object.
    const business = {
      biz_name: $("#biz_name").val().trim(),
      biz_type: $("#biz_type").val(),
      registration_number: $("#registration_number").val().trim(),
      biz_address: $("#biz_address").val().trim(),
      nature_of_bussiness: $("#nature_of_bussiness").val().trim(),
      numberOfYears: $("#numberOfYears").val().trim(),
      numberOfEmployees: $("#numberOfEmployees").val().trim(),
      annualRevenue: $("#annualRevenue").val().trim(),
      TIN: $("#TIN").val().trim(),
      biz_phone: $("#biz_phone").val().trim(),
      biz_email: $("#biz_email").val().trim(),
    };

    // Collect neighbor entries.
    const neighbor = [];
    $(".neighbor-fields").each(function () {
      neighbor.push({
        name: $(this).find('input[name="neighbor_name[]"]').val(),
        address: $(this).find('input[name="neighbor_address[]"]').val(),
        phone: $(this).find('input[name="neighbor_phone[]"]').val(),
      });
    });

    // Collect family entries.
    const family = [];
    $(".family-fields").each(function () {
      family.push({
        name: $(this).find('input[name="family_name[]"]').val(),
        relationship: $(this).find('input[name="family_relationship[]"]').val(),
        phone: $(this).find('input[name="family_phone[]"]').val(),
        address: $(this).find('input[name="family_address[]"]').val(),
      });
    });

    // Build educational history.
    const educationalHistory = {
      primarySchool: {
        name: $('input[name="primarySchool.name"]').val(),
        address: $('input[name="primarySchool.address"]').val(),
        yearOfAttendance: $(
          'input[name="primarySchool.yearOfAttendance"]'
        ).val(),
      },
      secondarySchool: {
        name: $('input[name="secondarySchool.name"]').val(),
        address: $('input[name="secondarySchool.address"]').val(),
        yearOfAttendance: $(
          'input[name="secondarySchool.yearOfAttendance"]'
        ).val(),
      },
      tertiaryInstitutions: [],
    };

    $(".institution-fields").each(function (index) {
      const institution = {
        name: $(this)
          .find(
            `input[name="educationalHistory.tertiaryInstitutions[${index}].name"]`
          )
          .val(),
        address: $(this)
          .find(
            `input[name="educationalHistory.tertiaryInstitutions[${index}].address"]`
          )
          .val(),
        certificateObtained: $(this)
          .find(
            `input[name="educationalHistory.tertiaryInstitutions[${index}].certificateObtained"]`
          )
          .val(),
        matricNo: $(this)
          .find(
            `input[name="educationalHistory.tertiaryInstitutions[${index}].matricNo"]`
          )
          .val(),
        yearOfAttendance: $(this)
          .find(
            `input[name="educationalHistory.tertiaryInstitutions[${index}].yearOfAttendance"]`
          )
          .val(),
      };
      educationalHistory.tertiaryInstitutions.push(institution);
    });

    // Employment History
    const employmentHistory = [];
    $(".employment-fields").each(function () {
      employmentHistory.push({
        companyName: $(this).find('input[name="companyName[]"]').val(),
        address: $(this).find('input[name="address[]"]').val(),
        designation: $(this).find('input[name="designation[]"]').val(),
        startYear: $(this).find('input[name="startYear[]"]').val(),
        endYear: $(this).find('input[name="endYear[]"]').val(),
        isCurrentEmployment: $(this)
          .find('input[name="isCurrentEmployment[]"]')
          .is(":checked"),
        description: $(this).find('textarea[name="description[]"]').val(),
      });
    });

    // Return both the FormData (with file uploads) and our JSON–ready objects.
    return {
      formData,
      nextOfKin,
      healthInfo,
      business,
      educationalHistory,
      employmentHistory,
      neighbor,
      family,
    };
  };

  /* ===================================================
   * Auto-Save / Update Handling
   * =================================================== */

  const autoSave = async () => {
    try {
      // Collect all the form data.
      const {
        formData,
        nextOfKin,
        healthInfo,
        business,
        educationalHistory,
        employmentHistory,
        neighbor,
        family,
      } = collectFormData();

      // Append the JSON–structured data.
      formData.append("nextOfKin", JSON.stringify(nextOfKin));
      formData.append("healthInfo", JSON.stringify(healthInfo));
      formData.append("business", JSON.stringify(business));
      formData.append("educationalHistory", JSON.stringify(educationalHistory));
      formData.append("employmentHistory", JSON.stringify(employmentHistory));
      formData.append("neighbor", JSON.stringify(neighbor));
      formData.append("family", JSON.stringify(family));

      // Handle identification – use the alternative input if "others" is selected.
      const selectedValue = $("#identification").val();
      const otherValue = $("#other-identification").val();
      const finalIdentification =
        selectedValue === "others" ? otherValue : selectedValue;
      formData.append("identification", finalIdentification);

      // Send the PUT request to update the user.
      const response = await fetch(`${BACKEND_URL}/users/${user.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        console.log("Auto-save successful");
        $("#autoSaveStatus").text("Saved").css("color", "green");
      } else {
        console.error("Auto-save failed", response.statusText);
        $("#autoSaveStatus").text("Failed to save").css("color", "red");
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      $("#autoSaveStatus").text("Failed to save").css("color", "red");
    }
  };

  /* ===================================================
   * Event Bindings
   * =================================================== */

  const bindEvents = () => {
    // Bind the click events to add new sections.
    $("#add-institution").on("click", addInstitution);
    $("#add-neighbor").on("click", addNeighbor);
    $("#add-family").on("click", addFamily);
    $("#add-employment").on("click", addEmployment);

    $(document).on("input change", "input, select, textarea", function () {
      clearTimeout(state.autoSaveTimer);
      $("#autoSaveStatus").text("Saving...").css("color", "blue");
      state.autoSaveTimer = setTimeout(autoSave, 1000); // 1-second debounce
    });

    // For final submission – prevent default and trigger auto-save.
    // $("#unifiedForm").on("submit", function (e) {
    //   e.preventDefault();
    //   autoSave();
    // });
  };

  // Initialize all event bindings.
  bindEvents();
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

  // Fetch and display user details in a modern profile modal
  const viewDetails = (userId) => {
    const url = `${BACKEND_URL}/users/${userId}`;
    const headers = { Authorization: `Bearer ${token}` };

    apiRequest(
      url,
      "GET",
      headers,
      null,
      (response) => {
        // Construct user details dynamically
        const details = `
        <div class="user-profile">
          <div class="profile-header">
            <img 
              // src="${
                response.passportPhoto || "/assets/images/avatar.jpeg"
              }" 
              alt="Passport Photo" 
              class="profile-photo" 
              crossOrigin="anonymous"
            >
            <h2 class="profile-name">${response.firstname} ${
          response.lastname
        }</h2>
            <p class="profile-role">${response.role}</p>
          </div>
          <div class="profile-details">
            <p><strong>Email:</strong> ${response.email}</p>
            <p><strong>Phone:</strong> ${response.phone}</p>
          </div>
        </div>
      `;
        $("#details-modal .modal-body").html(details); // Populate modal with user details
        $("#details-modal").modal("show"); // Show the
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
            <div class="dropdown">
              <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item btn-approve" data-id="${
                  item._id
                }" style="color: green;">Approve</button></li>
                <li><button class="dropdown-item btn-reject" data-id="${
                  item._id
                }" ${
        isRejected ? "disabled" : ""
      } style="color: red;">Reject</button></li>
                <li><button class="dropdown-item btn-view" data-id="${
                  item._id
                }" style="color: blue;">View</button></li>
              </ul>
            </div>
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
      <div id="loadingIndicator" style="display: none;">
      <div class="loader"></div>
     </div>
        <div class="dropdown">
          <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <button class="dropdown-item btn-download" data-id="${
                data._id
              }" ${isDisabled ? "disabled" : ""} style="color: green;">
                Download Certificate
              </button>
            </li>
            <li>
              <button class="dropdown-item view-details-btn" data-id="${
                data._id
              }" style="color: blue;">
                View Certificate
              </button>
            </li>
            ${
              data.status === "Rejected" && data.resubmissionAllowed
                ? `<li><button class="dropdown-item resubmit-btn" data-id="${data._id}" data-name="${data.firstname}" style="color: orange;">
                     Resubmit
                   </button></li>`
                : ""
            }
            
             ${
               data.status === "Rejected"
                 ? `<li><button class="dropdown-item delete-btn" data-id="${data._id}" style="color: red;">
                 Delete request
               </button></li>`
                 : ""
             }
            
          </ul>
        </div>
      </td>
    </tr>
  `);
        };

        if (data.status === "Rejected" || data.status === "Pending") {
          appendRow(true);
        } else if (data.status === "Approved") {
          appendRow(false);
        }

        // Attach click event to view-details-btn
        $(".view-details-btn").on("click", function () {
          const certificateId = $(this).data("id");
          window.location.href = `cert-temp.html?id=${certificateId}`;
        });

        // Handle Certificate Download
        async function handleDownload(certificateId) {
          if (
            !confirm(
              "Warning! Sure you want to download? Click ok to continue or else click cancel. You can only download once."
            )
          ) {
            return;
          }

          try {
            // Show loading indicator
            showLoadingIndicator();

            // Fetch the certificate PDF
            const blob = await fetchCertificatePdf(certificateId);

            // Trigger the download
            triggerDownload(blob, "certificate.pdf");

            // Notify the user of success
            showSuccessMessage("Certificate downloaded successfully!");
          } catch (error) {
            // Handle errors
            console.error(error.responseJSON?.message);
            const errorMessage =
              error.responseJSON?.message ||
              "Failed to download the certificate.";
            showErrorMessage(errorMessage);
          } finally {
            // Hide loading indicator
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
        function showLoadingIndicator() {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
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
          console.log("Success:", message);
          alert(message); // Replace with a toast notification if needed
        }

        // Show an error message
        function showErrorMessage(message) {
          console.error("Error:", message);
          alert(message); // Replace with a toast notification if needed
        }

        // Add click event listeners for download buttons
        $(".btn-download").click(function () {
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

    // Handle delete certificate
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
            fetchData();
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
  // Initial fetch
  fetchData();
});

// Download Cert
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
              alert(" Certificate has already been downloaded.");
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

// // Id Card
$(document).ready(function () {
  const pageSize = 10;
  let currentPage = 1;
  let rejectionId = null;

  const apiHeaders = {
    Authorization: `Bearer ${token}`,
  };

  const tableBody = $("#view-all-card-table");

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
            <div class="dropdown">
              <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item btn-approve" data-id="${
                  item._id
                }" style="color: green;">Approve</button></li>
                <li><button class="dropdown-item btn-reject" data-id="${
                  item._id
                }" ${
        isRejected ? "disabled" : ""
      } style="color: red;">Reject</button></li>
                <li><button class="dropdown-item btn-view" data-id="${
                  item._id
                }" style="color: blue;">View</button></li>
              </ul>
            </div>
          </td>
        </tr>
      `);
    });
  }

  function fetchData(page) {
    $.ajax({
      url: `${BACKEND_URL}/idcard/request?page=${page}&limit=${pageSize}&statuses=Pending,Rejected`,
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

  // Handle card Approval
  function handleApproval(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/idcard/${requestId}/approve`,
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

  // Handle card rejection
  function handleRejection(rejectionReason) {
    if (!rejectionReason) {
      alert("Please provide a rejection reason.");
      return;
    }

    $.ajax({
      url: `${BACKEND_URL}/idcard/${rejectionId}/reject`,
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

  // Handle card view
  function handleView(requestId) {
    $.ajax({
      url: `${BACKEND_URL}/idcard/${requestId}/request`,
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

function updateLocalGovernmentsOfOrigin() {
  const stateSelect = document.getElementById("stateOfOrigin");
  const lgaSelect = document.getElementById("lgaOfOrigin");
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

function updateLocalGovernmentsOfResidence() {
  const stateSelect = document.getElementById("stateOfResidence");
  const lgaSelect = document.getElementById("lgaOfResidence");
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
        url: "https://restcountries.com/v3.1/all",
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
          Swal.fire("Oops...", "Failed to fetch countries data", "error");
        },
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
      <div id="loadingIndicator" style="display: none;">
      <div class="loader"></div>
     </div>
        <div class="dropdown">
          <button class="btn btn-xs btn-action dropdown-toggle" data-bs-toggle="dropdown">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <button class="dropdown-item btn-card-download" data-id="${
                data._id
              }" ${isDisabled ? "disabled" : ""} style="color: green;">
                Download Card
              </button>
            </li>
            <li>
              <button class="dropdown-item view-card-btn" data-id="${
                data._id
              }" style="color: blue;">
                View Card
              </button>
            </li>
            ${
              data.status === "Rejected" && data.resubmissionAllowed
                ? `<li><button class="dropdown-item resubmit-card-btn" data-id="${data._id}" data-name="${data.firstname}" style="color: orange;">
                     Resubmit
                   </button></li>`
                : ""
            }
            
             ${
               data.status === "Rejected"
                 ? `<li><button class="dropdown-item delete-card-btn" data-id="${data._id}" style="color: red;">
                 Delete request
               </button></li>`
                 : ""
             }
            
          </ul>
        </div>
      </td>
    </tr>
  `);
        };

        if (data.status === "Rejected" || data.status === "Pending") {
          appendRow(true);
        } else if (data.status === "Approved") {
          appendRow(false);
        }

        // Attach click event to view-card-btn
        $(".view-card-btn").on("click", function () {
          const cardId = $(this).data("id");
          window.location.href = `id-card-temp.html?id=${cardId}`;
        });

        // Handle Certificate Download
        async function handleDownload(cardId) {
          if (
            !confirm(
              "Warning! Sure you want to download? Click ok to continue or else click cancel. You can only download once."
            )
          ) {
            return;
          }

          try {
            // Show loading indicator
            showLoadingIndicator();

            // Fetch the certificate PDF
            const blob = await fetchCertificatePdf(cardId);

            // Trigger the download
            triggerDownload(blob, "card.pdf");

            // Notify the user of success
            showSuccessMessage("Card downloaded successfully!");
          } catch (error) {
            // Handle errors
            console.error(error.responseJSON?.message);
            const errorMessage =
              error.responseJSON?.message || "Failed to download the card.";
            showErrorMessage(errorMessage);
          } finally {
            // Hide loading indicator
            hideLoadingIndicator();
          }
        }

        function fetchCertificatePdf(cardId) {
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
        function showLoadingIndicator() {
          const loadingIndicator = document.getElementById("loadingIndicator");
          if (loadingIndicator) {
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
          console.log("Success:", message);
          alert(message); // Replace with a toast notification if needed
        }

        // Show an error message
        function showErrorMessage(message) {
          console.error("Error:", message);
          alert(message); // Replace with a toast notification if needed
        }

        // Add click event listeners for download buttons
        $(".btn-card-download").click(function () {
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
  }
  // Initial fetch
  fetchData();
});
