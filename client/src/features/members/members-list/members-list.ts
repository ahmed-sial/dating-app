import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MemberService } from '../../../core/services/member-service';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { Member } from '../../../types/member';
import { AccountService } from '../../../core/services/account-service';
import { PaginationResult } from '../../../types/paginationResult';
import { Paginator } from "../../../shared/paginator/paginator";
import { MemberParams } from '../../../types/memberParams';
import { FilterModal } from '../filter-modal/filter-modal';
import { MemberCard } from "../member-card/member-card";
import { LikesService } from '../../../core/services/likes-service';

@Component({
  selector: 'app-members-list',
  imports: [AsyncPipe, Paginator, FilterModal, MemberCard],
  templateUrl: './members-list.html',
  styleUrl: './members-list.css',
})
export class MembersList implements OnInit {
  @ViewChild('filterModal') modal!: FilterModal
  private _memberService = inject(MemberService)
  private _accountService = inject(AccountService)
  private _likesService = inject(LikesService)
  protected currentUser = this._accountService.currentUser
  protected members$!: Observable<PaginationResult<Member>>
  protected memberParams = new MemberParams()

  constructor() {
    this.loadMembers()
  }

  ngOnInit(): void {
    this._likesService.getLikeIds()
  }

  loadMembers() {
    this.members$ = this._memberService.getMembers(this.memberParams)
  }

  onPageChange(event: { pageNumber: number, pageSize: number }) {
    this.memberParams.pageNumber = event.pageNumber
    this.memberParams.pageSize = event.pageSize
    this.loadMembers()
  }
  openModal() {
    this.modal.open()
  }

  onClose() {}

  onFilterChange(data: MemberParams) {
    this.memberParams = data
    this.loadMembers()
  }

  resetFilters() {
    this.memberParams = new MemberParams()
    this.loadMembers()
  }

  get displayMessage(): string {
    const defaultParams = new MemberParams();

    const filters: string[] = [];

    if (this.memberParams.gender) {
      filters.push(this.memberParams.gender + 's')
    } else {
      filters.push('Males, Females');
    }

    if (this.memberParams.minAge !== defaultParams.minAge
      || this.memberParams.maxAge !== defaultParams.maxAge) {
      filters.push(` ages ${this.memberParams.minAge}-${this.memberParams.maxAge}`)
    }

    return filters.length > 0 ? `Selected: ${filters.join('  | ')}` : 'All members'
  }
}
