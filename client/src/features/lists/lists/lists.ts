import { Component, inject, OnInit, signal } from '@angular/core';
import { MemberCard } from '../../members/member-card/member-card';
import { LikesService } from '../../../core/services/likes-service';
import { Member } from '../../../types/member';
import { PaginationResult } from '../../../types/paginationResult';

@Component({
  selector: 'app-lists',
  imports: [MemberCard,],
  templateUrl: './lists.html',
  styleUrl: './lists.css'
})
export class Lists implements OnInit {
  private _likesService = inject(LikesService);
  protected predicate = 'liked';
  protected members = signal<Member[]>([])

  tabs = [
    { label: 'Liked', value: 'liked' },
    { label: 'Liked me', value: 'likedBy' },
    { label: 'Mutual', value: 'mutual' },
  ]

  ngOnInit(): void {
    this._likesService.getLikeIds()
    this.loadLikes();
  }

  setPredicate(predicate: string) {
    if (this.predicate !== predicate) {
      this.predicate = predicate;
      this.loadLikes();
    }
  }

  loadLikes() {
    this._likesService.getLikes(this.predicate).subscribe({
      next: members => {
        this.members.set(members)
      }
    })
  }
}
