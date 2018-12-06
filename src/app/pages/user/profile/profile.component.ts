import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { animate, style, AUTO_STYLE, state, transition, trigger } from '@angular/animations';
import '../../../../assets/charts/echart/echarts-all.js';
import { FileUploader } from 'ng2-file-upload';
import { ProfileService } from './profile.service';
import { CustomNotifyService } from '../../../components/shared/custom-notify.service';


const URL = 'https://evening-anchorage-3159.herokuapp.com/api/';



@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('fadeInOutTranslate', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translate(0)' }),
        animate('400ms ease-in-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('mobileMenuTop', [
      state('no-block, void',
        style({
          overflow: 'hidden',
          height: '0px',
        })
      ),
      state('yes-block',
        style({
          height: AUTO_STYLE,
        })
      ),
      transition('no-block <=> yes-block', [
        animate('400ms ease-in-out')
      ])
    ]),
  ]
})
export class ProfileComponent implements OnInit {

  hasBaseDropZoneOver = false;
  uploader1: FileUploader = new FileUploader({
    url: URL,
    isHTML5: true
  });
  editProfile = true;
  editManager = true;
  editBussinessManager = true;
  editProfileIcon = 'icofont-edit';
  editMngrProfileIcon = 'icofont-edit';
  editAbout = true;
  editAboutIcon = 'icofont-edit';
  currentUser: Object = {};
  firstName: string;
  pnotify: any;

  public editor;
  public editorContent = '';
  public editorConfig = {
    placeholder: 'About Your Bussiness'
  };


  public data: any;
  public rowsOnPage = 10;
  public filterQuery = '';
  public sortBy = '';
  public sortOrder = 'desc';
  profitChartOption: any;
  managerUser: any = {};
  bussinessProfile: any = {};
  constructor(public http: Http, private profileService: ProfileService, private notify: CustomNotifyService) {
    let currtUser = JSON.parse(JSON.stringify(localStorage.getItem('currentUser')));
    this.currentUser = JSON.parse(currtUser)
  }

  ngOnInit() {
    this.pnotify = this.notify.getPNotify();
    this.http.get(`assets/data/data.json`)
      .subscribe((data) => {
        this.data = data.json();
      });
    setTimeout(() => {
      this.profitChartOption = {
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            const date = new Date(params.value[0]);
            let data = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ';
            data += date.getHours() + ':' + date.getMinutes();
            return data + '<br/>' + params.value[1] + ', ' + params.value[2];
          },
          responsive: true
        },
        dataZoom: {
          show: true,
          start: 70
        },
        legend: {
          data: ['Profit']
        },
        grid: {
          y2: 80
        },
        xAxis: [{
          type: 'time',
          splitNumber: 10
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          name: 'Profit',
          type: 'line',
          showAllSymbol: true,
          symbolSize: function (value) {
            return Math.round(value[2] / 10) + 2;
          },
          data: (function () {
            const d: any = [];
            let len = 0;
            const now = new Date();
            while (len++ < 200) {
              const random1: any = (Math.random() * 30).toFixed(2);
              const random2: any = (Math.random() * 100).toFixed(2);
              d.push([new Date(2014, 9, 1, 0, len * 10000), random1 - 0, random2 - 0]);
            }
            return d;
          })()
        }]
      };
    }, 1);
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  toggleEditProfile() {
    this.editProfileIcon = (this.editProfileIcon === 'icofont-close') ? 'icofont-edit' : 'icofont-close';
    this.editProfile = !this.editProfile;
  }

  toggleManagerProfile() {
    this.editMngrProfileIcon = (this.editMngrProfileIcon === 'icofont-close') ? 'icofont-edit' : 'icofont-close';
    this.editManager = !this.editManager;
  }

  toggleBussinessManagerProfile() {
    // this.editProfileIcon = (this.editProfileIcon === 'icofont-close') ? 'icofont-edit' : 'icofont-close';
    this.editBussinessManager = !this.editBussinessManager;
  }

  toggleEditAbout() {
    this.editAboutIcon = (this.editAboutIcon === 'icofont-close') ? 'icofont-edit' : 'icofont-close';
    this.editAbout = !this.editAbout;
  }

  onEditorBlured(quill) {
  }

  onEditorFocused(quill) {
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  onContentChanged({ quill, html, text }) {
  }

  updateUserForm() {
    this.profileService.updateUser(this.currentUser).subscribe(data => {
      if (data.messsage == "success") {
        this.currentUser = { ...this.currentUser };
        this.getLatestInfo();
        if (!this.editProfile) {
          this.pnotify.success("Profile updated successfully");
          this.toggleEditProfile();
        }
        if (!this.editAbout)
          this.toggleEditAbout();
        if (!this.editBussinessManager)
          this.toggleBussinessManagerProfile();
        if (!this.editManager)
          this.toggleManagerProfile()
      }
    })
  }

  getLatestInfo() {
    this.profileService.getUpdatedInfo(this.currentUser).subscribe(data => {
      console.log(data, "updated info");
      // this.toggleEditProfile();
      // this.toggleEditAbout();
    })

  }

  createManagerTeam() {
    console.log(this.managerUser, "jjjjjjjjjjjjjjjjjj", typeof this.currentUser, ">>>>>>>>><<<<<<<<<<<<", typeof this.currentUser['teamMenbers']);
    if (this.currentUser && this.currentUser['teamMenbers']) {
      this.currentUser['teamMenbers'].push(this.managerUser);
    } else {
      this.currentUser['teamMenbers'] = [];
      this.currentUser['teamMenbers'].push(this.managerUser);
    }
    this.updateUserForm();

  }

  addBussinessProfile() {
    console.log(this.bussinessProfile, "ddddddddddddd");
    if (this.currentUser && this.currentUser['bussinessProfiles']) {
      this.currentUser['bussinessProfiles'].push(this.bussinessProfile);
    } else {
      this.currentUser['bussinessProfiles'] = [];
      this.currentUser['bussinessProfiles'].push(this.bussinessProfile);
    }
    this.updateUserForm();
  }

}
