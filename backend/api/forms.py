from django import forms

from users.models import User


class SignupRequestForm(forms.Form):
    role = forms.ChoiceField(
        choices=[
            (User.Role.STUDENT, "Student"),
            (User.Role.COMPANY, "Company"),
            (User.Role.TEACHER, "Teacher"),
        ]
    )
    email = forms.EmailField()
    password = forms.CharField()
    name = forms.CharField()
    company_name = forms.CharField(required=False)

    def clean_email(self):
        return self.cleaned_data["email"].strip().lower()

    def clean_name(self):
        return self.cleaned_data["name"].strip()

    def clean_company_name(self):
        return self.cleaned_data["company_name"].strip()

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get("role") == User.Role.COMPANY and not cleaned_data.get("company_name"):
            self.add_error("company_name", "This field is required when signing up as a company user.")
        return cleaned_data


class LoginRequestForm(forms.Form):
    role = forms.ChoiceField(
        choices=[
            (User.Role.STUDENT, "Student"),
            (User.Role.COMPANY, "Company"),
            (User.Role.TEACHER, "Teacher"),
            (User.Role.ADMIN, "Admin"),
        ],
        required=False,
    )
    email = forms.EmailField()
    password = forms.CharField()
    remember_me = forms.BooleanField(required=False)

    def clean_email(self):
        return self.cleaned_data["email"].strip().lower()


class PasswordChangeRequestForm(forms.Form):
    current_password = forms.CharField()
    new_password = forms.CharField()


class PasswordResetRequestForm(forms.Form):
    email = forms.EmailField()

    def clean_email(self):
        return self.cleaned_data["email"].strip().lower()


class PasswordResetConfirmRequestForm(forms.Form):
    uid = forms.CharField()
    token = forms.CharField()
    new_password = forms.CharField()
